import { useTranslation } from 'react-i18next';
import './TeamReviewCard.css';
import type { ProjectReview, ReviewStatus } from '../../../../api/schemas/ProjectSchema.ts';
import formatName from '../../../../utils/formatName.ts';
import {User} from "lucide-react";

export type { ReviewStatus };

interface TeamReviewCardProps {
    project?: ProjectReview;
    projectMembers?: string[];
    status?: ReviewStatus;
    onClick: () => void;
}

function TeamReviewCard({ project,  status, onClick }: TeamReviewCardProps) {
    const { t } = useTranslation();

    const title = project?.title ?? '';
    const reviewStatus = project?.reviewStatus ?? status ?? 'pending';

    return (
        <button className="teamReviewCard" onClick={onClick}>
            <div className="teamReviewLeft">
                <p className="teamReviewProjectTitle">{title}
                    <span className={`statusLabel statusLabel--${reviewStatus}`}>
                        {t(`reviewStatus.${reviewStatus}`)}
                    </span></p>

                <span className="teamReviewMembers">
                    {project?.team?.members && project.team.members.length > 0 && (
                        project.team.members.map((member) => (
                            <div className="teamReviewMember">
                                <User size={15} strokeWidth={1.8} className="teamReviewMemberIcon"/>
                                {formatName(member.name)}
                            </div>
                        ))
                    )}
                </span>

                {/*<div className="cardStatusRow">*/}
                {/*    <span className={`statusLabel statusLabel--${reviewStatus}`}>*/}
                {/*        {t(`reviewStatus.${reviewStatus}`)}*/}
                {/*    </span>*/}
                {/*</div>*/}
            </div>
        </button>
    );
}

export default TeamReviewCard;