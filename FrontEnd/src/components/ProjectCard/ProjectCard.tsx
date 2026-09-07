import './ProjectCard.css';
import { useNavigate } from 'react-router-dom';
import { Plus, Star } from 'lucide-react';
import { useTranslation } from "react-i18next";
import type { ProjectCard } from "../../api/schemas/ProjectSchema.ts";
import formatName from "../../utils/formatName.ts";

export function ProjectCardAdd({ onClick }: { onClick: () => void }) {
    const { t } = useTranslation();

    return (
        <div className="cardContainer addNewProject" onClick={() => onClick()}>
            <div className="addContainer">
                <Plus size={24} strokeWidth={2} />
                <p>{t('create_project_text')}</p>
            </div>
        </div>
    );
}

interface ProjectCardComponentProps {
    project: ProjectCard;
    similarity?: number;
    showStatus?: boolean;
    onClick?: () => void;
}

export function ProjectCardComponent({ project, similarity, showStatus, onClick }: ProjectCardComponentProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const firstMemberName = project.team?.members?.[0]?.name;
    const additionalMembersCount = (project.team?.members?.length ?? 1) - 1;

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(`/project/${project.id}`);
        }
    };

    return (
        <div className="cardContainer" onClick={handleClick}>
            {similarity !== undefined && (
                <div className="cardStatusRow similarityStaus">
                    {similarity}%
                </div>
            )}

            <p className="TitleText">{project.title}
                {showStatus && project.status && (
                    <span className={`statusLabel statusLabel--${project.status}`}>
                        {t(`reviewStatus.${project.status}`)}
                    </span>
                )}
            </p>
            <p className="DescriptionText">{project.description}</p>
            <div className="cardBottomContainer">
                <div className="ratingContainer">
                    {project.rating ? (
                        <>
                            <Star
                            width={18}
                            height={18}
                            style={{marginRight: '6px'}}
                            fill="#facc15"
                            stroke="#facc15"
                            />
                            <p className="BottomText">{project.rating ?? ' '}</p>
                        </>
                    ) : (' ')}

                </div>

                {firstMemberName && (
                    <p className="BottomText">
                        {formatName(firstMemberName)}
                        {additionalMembersCount > 0 && ` (+${additionalMembersCount})`}
                    </p>
                )}
            </div>


        </div>
    );
}

export default ProjectCardComponent;
