import { ChevronDown, ArrowRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import './IdeaFieldAccordion.css';
import { computeWordTokens, type WordToken } from '../../utils/diffUtils.ts';

interface IdeaFieldAccordionProps {
    label: string;
    score?: number | null;
    previousScore?: number | null;
    text?: string | null;
    previousText?: string | null;
    diffMode?: boolean;
    defaultOpen?: boolean;
}

function IdeaFieldAccordion({
    label,
    score,
    previousScore,
    text,
    previousText,
    diffMode = false,
    defaultOpen = false,
}: IdeaFieldAccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const displayScore = score != null
        ? (score <= 1.0 ? Math.round(score * 100) : Math.round(score))
        : null;

    const displayPrevScore = previousScore != null
        ? (previousScore <= 1.0 ? Math.round(previousScore * 100) : Math.round(previousScore))
        : null;

    const scoreDelta = (displayScore !== null && displayPrevScore !== null)
        ? displayScore - displayPrevScore
        : null;

    const hasTextDiff = Boolean(
        diffMode &&
        previousText !== undefined &&
        previousText !== null &&
        previousText.trim() !== (text || '').trim()
    );

    const wordTokens = useMemo(() => {
        if (!hasTextDiff || previousText == null || text == null) return [];
        return computeWordTokens(previousText, text);
    }, [hasTextDiff, previousText, text]);

    return (
        <div className="ideaFieldCard">
            <button type="button" className="ideaFieldHeader" onClick={() => setIsOpen(!isOpen)}>
                <span className="ideaFieldLabel">{label}</span>
                <div className="ideaFieldRight">
                    {diffMode && displayPrevScore !== null && displayScore !== null ? (
                        <div className="ideaScoreDiffBadge">
                            <span className="ideaScoreOld">{displayPrevScore}%</span>
                            <ArrowRight size={11} className="ideaScoreArrow" />
                            <span className="ideaScoreNew">{displayScore}%</span>
                            {scoreDelta !== 0 && (
                                <span className={`ideaScoreDelta ${scoreDelta! > 0 ? 'ideaScoreDelta--pos' : 'ideaScoreDelta--neg'}`}>
                                    ({scoreDelta! > 0 ? `+${scoreDelta}` : scoreDelta}%)
                                </span>
                            )}
                        </div>
                    ) : (
                        displayScore !== null && <span className="ideaFieldScore">{displayScore}%</span>
                    )}
                    <ChevronDown
                        size={18}
                        className={`ideaFieldChevron ${isOpen ? 'ideaFieldChevronOpen' : ''}`}
                    />
                </div>
            </button>

            {isOpen && (
                <div className="ideaFieldBody">
                    {hasTextDiff ? (
                        <div className="ideaFieldDiffText">
                            {wordTokens.map((tk: WordToken, idx: number) => {
                                if (tk.type === 'added') {
                                    return <ins key={idx} className="diffWordIns">{tk.text}</ins>;
                                }
                                if (tk.type === 'removed') {
                                    return <del key={idx} className="diffWordDel">{tk.text}</del>;
                                }
                                return <span key={idx}>{tk.text}</span>;
                            })}
                        </div>
                    ) : (
                        <p className="ideaFieldText">{text}</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default IdeaFieldAccordion;