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
    return (
        <div className="draftInputPanel">
            <div className="draftInputHeader">
                <span className="draftInputLabel">Tvoj nápad</span>
                {loading && <span className="draftInputSpinner" />}
            </div>
            <input
                className="draftInputTitle"
                placeholder="Názov projektu"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
            />
            <textarea
                className="draftInputDescription"
                placeholder="V dvoch-troch vetách opíš zámer..."
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                rows={3}
            />
        </div>
    );
}

export default IdeaDraftInput;