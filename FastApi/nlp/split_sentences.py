import re

_SK_CLAUSE_MARKERS = re.compile(r"\b(a|ale|alebo|takže)\b", flags=re.IGNORECASE)

_ABBREVIATIONS = {
    "napr", "atď", "resp", "tzv", "str", "č", "cca",
    "ing", "mgr", "phd", "doc", "prof", "bc",
}

_SENTENCE_BOUNDARY = re.compile(r'(?<=[.!?])\s*(?!\d)')


def _looks_like_abbreviation(sentence_end: str) -> bool:
    last_word = sentence_end.rstrip(".!?").split()[-1].lower() if sentence_end.rstrip(".!?").split() else ""
    return last_word in _ABBREVIATIONS


def _needs_fallback(sentences: list[str], min_words_per_sentence: int = 40) -> bool:
    if len(sentences) != 1:
        return False
    return len(sentences[0].split()) > min_words_per_sentence


def _fallback_clause_split(text: str, min_clause_words: int = 4) -> list[str]:
    parts = _SK_CLAUSE_MARKERS.split(text)
    if len(parts) == 1:
        return [text]

    chunks: list[str] = []
    buffer = parts[0].strip()
    i = 1
    while i < len(parts):
        marker = parts[i]
        following = parts[i + 1] if i + 1 < len(parts) else ""
        following_clean = " ".join(following.split())
        if len(buffer.split()) >= min_clause_words:
            chunks.append(buffer.strip())
            buffer = f"{marker} {following_clean}".strip()
        else:
            buffer = f"{buffer} {marker} {following_clean}".strip()
        i += 2

    if buffer.strip():
        chunks.append(buffer.strip())

    return chunks if len(chunks) > 1 else [text]


def _clean(sentences: list[str], min_words: int = 3) -> list[str]:
    cleaned = []
    for s in sentences:
        s = s.strip()
        if not s:
            continue
        if len(s.split()) < min_words:
            continue
        cleaned.append(s)
    return cleaned


def split_sentences(text: str, min_words: int = 3) -> list[str]:
    text = (text or "").strip()
    if not text:
        return []
    raw_parts = _SENTENCE_BOUNDARY.split(text)
    sentences: list[str] = []
    buffer = ""
    for part in raw_parts:
        buffer = f"{buffer} {part}".strip() if buffer else part
        if not _looks_like_abbreviation(buffer):
            sentences.append(buffer.strip())
            buffer = ""
    if buffer:
        sentences.append(buffer.strip())
    sentences = [s for s in sentences if s]
    if _needs_fallback(sentences):
        sentences = _fallback_clause_split(text)
    return _clean(sentences, min_words=min_words)