import numpy as np
from sqlmodel import select

from project.models import Category


_CALIBRATION_GENERIC = [
    "Ľudia.",
    "Všetci ľudia, ktorí niečo potrebujú.",
    "Bežní používatelia internetu.",
    "Zákazníci vo všeobecnosti.",
    "Ktokoľvek, kto má záujem o produkt.",
    "Široká verejnosť.",
    "Muži a ženy rôzneho veku.",
    "Ľudia, ktorí niečo hľadajú online.",
    "Každý, kto má smartfón.",
    "Všetci používatelia bez rozdielu.",
]

_CALIBRATION_SPECIFIC = [
    "Bakalárski študenti prvých ročníkov a vyučujúci na FIIT STU hľadajúci učebne podľa AIS rozvrhu.",
    "Domáci pestovatelia izbových rastlín v slovenských bytoch s nepravidelným režimom polievania.",
    "Dopravní dispečeri a inžinieri magistrátu Bratislavy nastavujúci svetelnú signalizáciu v špičkách.",
    "Vysokoškolskí študenti bývajúci na internátoch hospodáriaci s obmedzeným mesačným rozpočtom na stravu.",
    "Venture capital investori a fondy ranného štádia hodnotiace technologické patenty a nehmotné aktíva startupov.",
    "Vedúci logistiky v strednej výrobnej firme zodpovední za objednávanie náhradných dielov.",
    "Majitelia rodinných domov staršej ako 20 rokov, ktorí plánujú výmenu strechy.",
    "Turisti hľadajúci krátkodobé ubytovanie v historickom centre mesta počas letnej sezóny.",
    "Účtovníčky v malých firmách, ktoré ručne spracúvajú faktúry v Exceli.",
    "Rodičia detí predškolského veku hľadajúci mimoškolské krúžky v okolí bydliska.",
    "Freelance grafici, ktorí potrebujú nástroj na fakturáciu klientom v zahraničí.",
]

class CategoryStore:

    def __init__(self):
        self.ids: list[int] = []
        self.names: list[str] = []
        self.embeddings: np.ndarray | None = None

    async def load(self, session):
        result = await session.exec(select(Category))
        categories = result.all()

        self.ids = [c.id for c in categories]
        self.names = [c.name for c in categories]
        self.embeddings = np.array([c.embedding for c in categories])

    def classify(self, project_embedding: np.ndarray, top_n: int = 4):
        if self.is_empty:
            return []

        sims = self.embeddings @ project_embedding
        top_idx = np.argsort(-sims)[:top_n]

        return [(self.ids[i], self.names[i], float(sims[i])) for i in top_idx]

    @property
    def is_empty(self) -> bool:
        return not self.ids


class NicheAnchorStore:

    def __init__(self):
        self.generic: np.ndarray | None = None
        self.specific: np.ndarray | None = None
        self.lo: float | None = None
        self.hi: float | None = None

    async def load(self, model):
        g_vecs = model.encode(_CALIBRATION_GENERIC, convert_to_numpy=True, normalize_embeddings=True)
        s_vecs = model.encode(_CALIBRATION_SPECIFIC, convert_to_numpy=True, normalize_embeddings=True)

        generic_vec = g_vecs.mean(axis=0)
        generic_vec /= (np.linalg.norm(generic_vec) + 1e-12)
        specific_vec = s_vecs.mean(axis=0)
        specific_vec /= (np.linalg.norm(specific_vec) + 1e-12)

        g_diffs = g_vecs @ specific_vec - g_vecs @ generic_vec
        s_diffs = s_vecs @ specific_vec - s_vecs @ generic_vec

        self.generic = generic_vec
        self.specific = specific_vec
        self.lo = float(g_diffs.min())
        self.hi = float(s_diffs.max())

    @property
    def is_empty(self) -> bool:
        return self.generic is None

