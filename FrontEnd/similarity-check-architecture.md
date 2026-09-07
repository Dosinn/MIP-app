# Архітектура та Технічна Специфікація: Інтелектуальний Similarity Check Engine

Цей документ містить повний технічний опис розширення системи Similarity Check: від математичних методів та NLP-алгоритмів до структури мікросервісів, моделей та пайплайну обробки даних.

---

## 1. Архітектурний огляд (High-Level Architecture)

```
[ Frontend (React PWA) ]
      │  ▲
      │  │ REST (JSON)
      ▼  │
[ Backend (Spring Boot 3 + PostgreSQL) ]
      │  ▲
      │  │ HTTP / Internal API
      ▼  │
[ ML/NLP Microservice (Python FastAPI) ]
      ├── Sentence Transformers (paraphrase-multilingual-mpnet-base-v2)
      ├── spaCy (Sentencizer + Light NER `_sm`)
      ├── scikit-learn (AgglomerativeClustering, Cosine Similarity)
      └── UMAP-learn & HDBSCAN (Dimension Reduction & Niche Clustering)
```

---

## 2. Етапи реалізації та алгоритмічний пайплайн

### Етап 0: Ранній Similarity-Gate (Early Validation Gate)

**Мета:** Швидка перевірка на дублювання на етапі короткої назви/elevator pitch (1–2 речення) до заповнення детальних полів.

* **Вхідні дані:** `title` (str), `pitch` (str, 1–2 речення).
* **Технічний пайплайн:**
  1. Конкатенація `text = f"{title}. {pitch}"`.
  2. Генерація dense vector embedding через `SentenceTransformer("paraphrase-multilingual-mpnet-base-v2")` (розмірність: 768 float32).
  3. Пошук $k$-найближчих сусідів (k-NN) серед активних студентських проектів за допомогою косинусної схожості:
     $$\text{cosine\_sim}(\vec{u}, \vec{v}) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|}$$
  4. Поріг спрацьовування: $\text{threshold} \approx 0.78 - 0.82$.
* **Логіка розгалуження (UI/UX State Machine):**
  * Якщо `max(sim) >= threshold`:
    * UI показує картку найбільш схожого проекту: *«Схоже на [Проект X] (Similarity: Y%)»*.
    * Варіант А: **«Vylepšiť existujúci projekt (Improve)»** $\rightarrow$ перемикає проект у режим `improves_project_id = X.id`.
    * Варіант Б: **«Pokračovať ako nový projekt»** $\rightarrow$ ID знайденого проекту $X$ зберігається в контексті форми як `baseline_neighbor_id = X.id` і передається на Етап A.3.

---

### Етап A: Двигун аналізу трьох полів (3-Field Analysis Engine)

Замість одного текстового поля створюються 3 окремі поля:
1. `problem` (Проблема)
2. `target_audience` (Цільова аудиторія)
3. `uniqueness` (Унікальність / Диференціація)

#### A.1. Поле «Проблема» (Cohesion & Focus Score)
* **Мета:** Виміряти смислову зв'язність і сфокусованість тексту проблеми (уникнути розмитих тез).
* **Алгоритм:**
  1. Розбиття тексту на речення $S = [s_1, s_2, \dots, s_n]$ через `spaCy` (компонент `sentencizer` або легка модель `sk_core_news_sm` / `xx_sent_ud_sm`).
  2. Отримання векторів кожного речення: $E = [\vec{e}_1, \vec{e}_2, \dots, \vec{e}_n]$.
  3. Якщо $n \ge 2$:
     * Обчислення попарної матриці косинусних подібностей між усіма парами $(s_i, s_j)$ де $i \ne j$.
     * $\text{Cohesion Score} = \frac{2}{n(n-1)} \sum_{i < j} \text{cosine\_sim}(\vec{e}_i, \vec{e}_j) \in [0, 1]$.
  4. Якщо $n = 1$: аналізується довжина та семантична щільність.
  5. **Інтерпретація:**
     * $> 0.70$ $\rightarrow$ Висока сфокусованість на одній проблемі.
     * $< 0.45$ $\rightarrow$ Розмитий опис / кілька непов'язаних проблем.

#### A.2. М'яка підказка (Heuristic Data/Evidence Nudge)
* **Мета:** Перевірити, чи підкріплена проблема фактами/числами (не впливає на скор, лише порада).
* **Алгоритм:**
  1. Regex-патерни для пошуку відсотків та числових метрик:
     * `(?:\d+(?:[.,]\d+)?\s*(?:%|percent|percento|mil|tis|eur|usd|\$|€))`
  2. Легка spaCy NER для пошуку сутностей `ORG` (джерела, організації, інститути):
     * `[ent.text for ent in doc.ents if ent.label_ in ("ORG", "PERCENT", "MONEY", "QUANTITY")]`
  3. Якщо збігів немає $\rightarrow$ повертається прапорець `has_evidence_hint = False` і UI показує м'який бейдж: *«Спробуйте додати конкретні дані або джерело дослідження»*.

#### A.3. Поле «Цільова аудиторія» (Customer Segmentation Diversity)
* **Мета:** Перевірити, чи студент бачить кілька конкретних сегментів аудиторії.
* **Алгоритм:**
  1. Сегментація тексту аудиторії на речення $A = [a_1, \dots, a_m]$.
  2. Генерація ембедингів речень $E_A = [\vec{a}_1, \dots, \vec{a}_m]$.
  3. **Hierarchical / Agglomerative Clustering** (`sklearn.cluster.AgglomerativeClustering`):
     * Параметри: `n_clusters=None`, `distance_threshold=0.45`, `metric='cosine'`, `linkage='average'`.
     * Працює стабільно і детерміністично навіть на 3–6 реченнях (на відміну від HDBSCAN чи KMeans).
  4. Кількість знайдених кластерів $K$:
     * $K \ge 2 \rightarrow$ Виділено кілька чітких цільових груп (наприклад: студенти, викладачі, бізнес).
     * $K = 1 \rightarrow$ Одна монолітна група або занадто загальний опис.

#### A.4. Поле «Унікальність» та Пошаровий аналіз схожості (Layered Overlap Breakdown)
* **Сценарій 1 (Був знайдений схожий проект на Кроці 0 — `baseline_neighbor_id != null`):**
  1. **Пошаровий аналіз схожості (Layered Overlap):** Замість однієї цифри, схожість з базовим проектом розкладається на 3 незалежні шари:
     * $\text{sim}_{\text{problem}} = \text{cosine\_sim}(\vec{v}_{\text{prob}}, \vec{v}_{\text{prob\_base}})$
     * $\text{sim}_{\text{audience}} = \text{cosine\_sim}(\vec{v}_{\text{aud}}, \vec{v}_{\text{aud\_base}})$
     * $\text{sim}_{\text{solution}} = \text{cosine\_sim}(\vec{v}_{\text{uniq}}, \vec{v}_{\text{uniq\_base}})$
  2. **Інтерпретація та вердикт інновації:**
     * **Пряма альтернатива / Інновація (`direct_alternative`):** Високий збіг проблеми/аудиторії ($\ge 0.70$), але низький збіг рішення ($\le 0.40$). *Студент вирішує ту саму відому проблему кардинально іншим шляхом — це схвалюється!*
     * **Дублікат (`duplicate`):** Усі 3 шари мають високу схожість ($\ge 0.75$).
     * **Суміжний напрямок (`adjacent`):** Низький збіг проблеми, але спільні технологічні механіки.
  3. **Discourse Markers:** Регулярні вирази для пошуку контрастних конструкцій:
     * Словацькі: `(na rozdiel od|v porovnaní s|naopak|namiesto toho|oproti|naša výhoda spočíva)`
     * Англійські: `(unlike|compared to|instead of|whereas|in contrast to|our advantage)`
  4. **Семантична дистанція диференціації:**
     $$\vec{v}_{uniq} = \text{Embedding}(\text{uniqueness\_text})$$
     $$\vec{v}_{base} = \text{Embedding}(P_{base}.\text{full\_text})$$
     $$\text{Differentiation Distance} = 1 - \text{cosine\_sim}(\vec{v}_{uniq}, \vec{v}_{base})$$
* **Сценарій 2 (Схожих проектів на кроці 0 не було):**
  * Аналізується кількість самостійних тез через `AgglomerativeClustering` (кількість чітких переваг).

#### A.5. Перевірка узгодженості Проблема-Рішення (Problem-Solution Alignment)
* **Мета:** Виявлення логічного розриву, коли описане рішення/унікальність не відповідає заявленій проблемі (наприклад, проблема про навігацію по кампусу, а рішення — генератор конспектів).
* **Алгоритм:**
  1. Генерація ембедингів $\vec{v}_{\text{problem}}$ та об'єднаного вектора рішення $\vec{v}_{\text{solution}} = \text{Embedding}(f"{title}. {pitch}. {uniqueness}")$.
  2. Обчислення смислової релевантності: $\text{alignment\_score} = \text{cosine\_sim}(\vec{v}_{\text{problem}}, \vec{v}_{\text{solution}})$.
  3. **Інтерпретація:**
     * $\ge 0.60$ $\rightarrow$ `aligned` (Рішення прямо б'є в корінь заявленої проблеми).
     * $< 0.40$ $\rightarrow$ `misaligned` (Логічний розрив: рішення слабко пов'язане з проблемою; видається попередження про необхідність синхронізації).

#### A.6. Загальний бейдж напрямку та насиченість ніші (Domain Badge & Niche Saturation)
* **Мета:** Автоматичне визначення тематичної сфери проекту та оцінка концентрації схожих тем на кафедрі (без штучного знецінення робіт).
* **Механізм:** Zero-Shot семантична класифікація через якірні описи доменів на базі `SentenceTransformer`:
  ```python
  DOMAIN_ANCHORS = {
      "EduTech & Štúdium": "Vzdelávanie, študentské materiály, e-learning, univerzita, kurzy, poznámky",
      "FinTech & E-commerce": "Platby, peniaze, financie, e-shop, investovanie, krypto, rozpočet",
      "Campus Life & Komunita": "Udalosti na fakulte, spolubývajúci, internáty, jedálne, študentský život",
      "Health, Sport & Well-being": "Zdravie, fitness, tréning, šport, strava, psychická pohoda, lekári",
      "Smart City & Eko": "Doprava, parkovanie, ekológia, odpad, udržateľnosť, mestské služby",
      "AI Tools & B2B": "Automatizácia, vývoj softvéru, AI asistenti, CRM, nástroje pre firmy"
  }
  ```
* **Рівень насиченості ніші (`niche_saturation`):**
  * `unique` — Невелика кількість схожих робіт у поточному корпусі (вільний простір на кафедрі).
  * `balanced` — Помірна кількість робіт (збалансований/актуальний напрямок).
  * `dense` — Висока концентрація робіт (популярна тема, потребує чіткої диференціації).

#### A.7. Радар архетипу ідеї (Startup DNA / Hexagon Radar)
* **Мета:** Багатовимірна візуалізація суті ідеї (замість однієї цифри) та візуальне порівняння (Overlay) з іншими проектами на мапі.
* **Принцип прив'язки до 5 наявних полів:** Осі радара вираховуються суто з тексту, який реально вводить студент (`title`, `pitch`, `problem`, `target_audience`, `uniqueness`):

| Вісь радара | Джерело полів | Що аналізується (NLP Semantic Projection) |
| :--- | :--- | :--- |
| **1. Гострота болю (Pain Intensity)** | `problem` | Абстрактна незручність (0.2) $\leftrightarrow$ Гострий щоденний біль / втрати (0.9) |
| **2. Доказовість (Evidence & Facts)** | `problem` | Теоретичні тези (0.2) $\leftrightarrow$ Відсотки, цифри, посилання на джерела (0.9) |
| **3. Конкретність аудиторії (Niche Precision)** | `target_audience` | «Всі люди» (0.1) $\leftrightarrow$ Чіткі 2–3 ролі (бакалаври, викладачі) (0.9) |
| **4. Рівень диференціації (Differentiation)** | `uniqueness` | Косметична зміна (0.2) $\leftrightarrow$ Структурна відмінність від сусіда (0.9) |
| **5. Рівень автоматизації (Tech Leverage)** | `title` + `pitch` + `uniqueness` | Звичайний ручний CRUD (0.2) $\leftrightarrow$ Алгоритми / AI / реал-тайм (0.9) |
| **6. Модель взаємодії (Solo vs Community)** | `target_audience` + `pitch` | Одиночний інструмент (0.2) $\leftrightarrow$ Спільна робота / P2P / ком'юніті (0.9) |

* **Механізм розрахунку:** Швидка біполярна семантична проєкція вектора тексту на полярні описи осі (займає < 1 мс на CPU).
* **UI/UX Overlay Comparison:** При кліку на будь-яку точку на мапі два радари (поточний драфт + обраний проект) накладаються один на одного, наочно показуючи різницю в концептах.

#### A.8. Композитна структура скору (API Response Contract)

```json
{
  "early_gate": {
    "has_similar": true,
    "top_similar_project_id": 42,
    "top_similarity_score": 0.81,
    "layered_overlap": {
      "problem_similarity": 0.88,
      "audience_similarity": 0.90,
      "solution_similarity": 0.22,
      "verdict": "direct_alternative"
    }
  },
  "project_badge": {
    "domain": "EduTech & Štúdium",
    "niche_saturation": "balanced",
    "confidence": 0.76
  },
  "alignment": {
    "score": 0.84,
    "status": "aligned",
    "warning": null
  },
  "dna_radar": {
    "pain_intensity": 0.82,
    "evidence_facts": 0.40,
    "niche_precision": 0.75,
    "differentiation": 0.68,
    "tech_leverage": 0.85,
    "community_model": 0.30
  },
  "dimensions": {
    "problem": {
      "cohesion_score": 0.78,
      "status": "focused", // "focused" | "scattered"
      "has_evidence": false,
      "hint": "Skuste pridat konkretne data alebo zdroj"
    },
    "audience": {
      "segment_count": 3,
      "status": "multi_segment", // "multi_segment" | "single_broad"
      "segments": ["Študenti VŠ", "Pedagógovia", "Administrátori fakúlt"]
    },
    "uniqueness": {
      "has_contrastive_markers": true,
      "differentiation_distance": 0.65, // 0 to 1
      "status": "well_differentiated"
    }
  },
  "overall_maturity_score": 82 // 0 to 100 (Idea Maturity Meter)
}
```

---

### Етап B: Мапа ніш (Idea Landscape Map — MDS / Multidimensional Scaling)

**Мета:** 2D інтерактивна візуалізація всього простору проектів університету (та зовнішніх стартап-прикладів) для пошуку вільних ринкових ніш.

> **Примітка щодо вибору алгоритму:** Для стабільності та детермінізму використовується **Classical MDS (Multidimensional Scaling)** із нелінійним контрастним масштабуванням дистанцій замість UMAP. Це забезпечує швидку реал-тайм Nyström-проєкцію для чернеток без перерахунку всього простору.

```
                  [ Cluster 1: FinTech & Crypto ]
                           ●  ● ●
                             ●
      [ Вільна ніша ]  <--- (Ваша ідея) ---> [ Cluster 2: EduTech / PWA ]
                                                ●  ●  ●
                                                  ● ●
                  [ Cluster 3: E-commerce & Delivery ]
                           ● ● ●
```

#### Математичний та алгоритмічний пайплайн:
1. **Збір корпусів:**
   * Усі активні та минулорічні проекти $P_1, \dots, P_N$.
   * Векторизація $\rightarrow$ матриця розмірності $(N, 768)$.
2. **Зниження розмірності для кластеризації (UMAP Step 1):**
   * Зменшення $768 \rightarrow d_{mid} = 10$ вимірів:
     ```python
     reducer_mid = umap.UMAP(
         n_neighbors=15,
         n_components=10,
         metric='cosine',
         min_dist=0.1,
         random_state=42
     )
     embeddings_10d = reducer_mid.fit_transform(embeddings_768d)
     ```
3. **Кластеризація за щільністю (HDBSCAN):**
   ```python
   clusterer = hdbscan.HDBSCAN(
       min_cluster_size=3,
       min_samples=2,
       metric='euclidean',
       cluster_selection_epsilon=0.3
   )
   cluster_labels = clusterer.fit_predict(embeddings_10d)
   # -1 = шум (унікальні проекти поза кластерами), 0..k = номери ніш
   ```
4. **2D проекція для UI (UMAP Step 2):**
   ```python
   reducer_2d = umap.UMAP(
       n_neighbors=15,
       n_components=2,
       metric='cosine',
       min_dist=0.25,
       random_state=42
   )
   points_2d = reducer_2d.fit_transform(embeddings_768d)
   # Отримуємо масив [x, y] для кожного проекту
   ```
5. **Проекція поточної ідеї студента в реальному часі:**
   * Коли студент змінює текст, вектор нової ідеї $\vec{v}_{new}$ трансформується у вже натренований простір:
     ```python
     new_point_2d = reducer_2d.transform([v_new_768d])[0]
     ```
   * На фронтенді нова ідея малюється як пульсуюча точка координат $(x_{new}, y_{new})$.

#### B.2. Траєкторія еволюції (Improvement Lineage Tracking)
* Зв'язок `improves_project_id` відображається на 2D-графіку як спрямована стрілка:
  $$\text{Проект}_{2025} (x_1, y_1) \xrightarrow{\text{improve}} \text{Проект}_{2026} (x_2, y_2)$$
* Наочно демонструє, чи проект пішов у глибину ніші, чи диверсифікувався на стик інших напрямків.

---

## 3. Необхідні Python бібліотеки (ML Service `requirements.txt`)

```text
fastapi>=0.110.0
uvicorn>=0.28.0
sentence-transformers>=2.5.1
torch>=2.2.0
spacy>=3.7.4
scikit-learn>=1.4.1
umap-learn>=0.5.5
hdbscan>=0.8.33
numpy>=1.26.4
pydantic>=2.6.0
```

---

## 4. План покрокового впровадження (Roadmap)

| Спринт | Завдання | Складність |
| :--- | :--- | :--- |
| **Спринт 1** | **Early Gate UI/UX**<br>Перенесення `useSimilarity` на перший крок форми створення проекту. Вибір: "Improve" або "New with Baseline". | Низька |
| **Спринт 2** | **3-Field Analysis API**<br>Python ендпоінт `/similarity/analyze-dimensions` (Cohesion, Agglomerative segmentation, Discourse markers). | Середня |
| **Спринт 3** | **Interactive Form Feedback**<br>Оновлення форми створення проекту в React з Live-індикаторами якості кожного з 3 полів. | Середня |
| **Спринт 4** | **Idea Landscape Map**<br>Ендпоінт UMAP+HDBSCAN `/similarity/landscape-map` + React Scatter Plot компонент (на базі SVG або Canvas). | Середня/Висока |

---
*Документ створено для технічного супроводу розробки розширення модулю Similarity Check.*


4. 📋 «Дашборд викладача з тепловою матрицею» (Teacher Heatmap Dashboard)
У тебе вже є TeacherPage і TeacherProjectReview. Додати на TeacherPage аналітичний блок:

Викладач бачить матрицю-хітмеп усіх своїх студентів:

Студент	Проблема	Аудиторія	Унікальність	Alignment	Maturity
Петро К.	🟢 0.82	🟡 0.55	🔴 0.28	🟢	54%
Маша Л.	🟢 0.91	🟢 0.78	🟢 0.72	🟢	87%
Ігор В.	🔴 0.31	🔴 0.22	🟡 0.45	🔴	29%
Викладач одразу бачить, хто потребує допомоги з формулюванням, а хто вже готовий до рецензії. Замість перечитування 30 текстів — одна таблиця з кольоровим кодуванням.

5. 🧬 «Порівняння версій проєкту через радар» (Version Diff via DNA Radar)
У тебе вже є ProjectHistory в бекенді. Коли студент редагує проєкт після коментарів викладача — система зберігає новий snapshot радара. На сторінці проєкту можна перемикатися між версіями:

До коментарів викладача → Після редагування

Два радари накладаються, і студент та викладач бачать:

«Після ревізії: конкретність аудиторії виросла з 0.3 до 0.8 🟢, доказовість покращилась 🟢, але диференціація впала 🔴 — перепишіть поле унікальності.»
Це перетворює процес рецензії з суб'єктивного «переробіть» на об'єктивну візуальну різницю.

