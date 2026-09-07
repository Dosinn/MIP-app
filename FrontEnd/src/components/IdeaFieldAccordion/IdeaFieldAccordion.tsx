import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import './IdeaFieldAccordion.css';

interface IdeaFieldAccordionProps {
    label: string;
    score?: number | null;
    text?: string | null;
    defaultOpen?: boolean;
}

function IdeaFieldAccordion({ label, score, text, defaultOpen = false }: IdeaFieldAccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const displayScore = score != null
        ? (score <= 1.0 ? Math.round(score * 100) : Math.round(score))
        : null;

    return (
        <div className="ideaFieldCard">
            <button className="ideaFieldHeader" onClick={() => setIsOpen(!isOpen)}>
                <span className="ideaFieldLabel">{label}</span>
                <div className="ideaFieldRight">
                    {displayScore !== null && <span className="ideaFieldScore">{displayScore}%</span>}
                    <ChevronDown
                        size={18}
                        className={`ideaFieldChevron ${isOpen ? 'ideaFieldChevronOpen' : ''}`}
                    />
                </div>
            </button>

            {isOpen && (
                <div className="ideaFieldBody">
                    <p className="ideaFieldText">{text}</p>
                </div>
            )}
        </div>
    );
}

export default IdeaFieldAccordion;