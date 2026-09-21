import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, X, Loader } from 'lucide-react';
import './IdeaDraftInput.css';

interface IdeaDraftInputProps {
    title: string;
    description: string;
    onTitleChange: (v: string) => void;
    onDescriptionChange: (v: string) => void;
    loading: boolean;
}

function IdeaDraftInput({
    title,
    description,
    onTitleChange,
    onDescriptionChange,
    loading,
}: IdeaDraftInputProps) {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(true);

    const hasContent = Boolean(title.trim() || description.trim());

    const handleClear = () => {
        onTitleChange('');
        onDescriptionChange('');
    };

    if (collapsed) {
        return (
            <button
                type="button"
                className="draftInputPanel draftInputPanel--collapsed"
                onClick={() => setCollapsed(false)}
                aria-label={t('map_draft_expand')}
            >
                <div className="draftInputCollapsedContent">
                    <span className="draftInputCollapsedText">
                        {hasContent ? (title.trim() || t('map_draft_badge')) : t('map_draft_expand')}
                    </span>
                    {loading ? (
                        <Loader size={14} className="draftInputSpinnerAnim" />
                    ) : (
                        <ChevronUp size={16} className="draftInputChevron" />
                    )}
                </div>
            </button>
        );
    }

    return (
        <div className="draftInputPanel">
            <div className="draftInputHeader">
                <span className="draftInputLabel">{t('map_draft_badge')}</span>

                <div className="draftInputHeaderRight">
                    {loading && (
                        <div className="draftInputStatus">
                            <Loader size={13} className="draftInputSpinnerAnim" />
                            <span className="draftInputStatusText">{t('map_draft_calculating')}</span>
                        </div>
                    )}
                    {hasContent && !loading && (
                        <button
                            type="button"
                            className="draftInputIconBtn"
                            onClick={handleClear}
                            title={t('map_draft_clear')}
                            aria-label={t('map_draft_clear')}
                        >
                            <X size={14} />
                        </button>
                    )}
                    <button
                        type="button"
                        className="draftInputIconBtn"
                        onClick={() => setCollapsed(true)}
                        title={t('map_draft_collapse')}
                        aria-label={t('map_draft_collapse')}
                    >
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>

            <div className="draftInputFieldGroup">
                <input
                    className="draftInputTitle"
                    placeholder={t('map_draft_title_placeholder')}
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                />
            </div>

            <div className="draftInputFieldGroup">
                <textarea
                    className="draftInputDescription"
                    placeholder={t('map_draft_desc_placeholder')}
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    rows={2}
                />
            </div>

            <div className="draftInputFooter">
                <span className="draftInputHint">{t('map_draft_hint')}</span>
            </div>
        </div>
    );
}

export default IdeaDraftInput;