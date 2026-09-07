import QueryState from "../../../components/QueryState/QueryState.tsx";
import {useTranslation} from "react-i18next";
import type {UseQueryResult} from "@tanstack/react-query";
import type {ProjectReview} from "../../../api/schemas/ProjectSchema.ts";
import TeamMembersList from "../../../components/TeamMembersList/TeamMembersList.tsx";

interface TeamsTabProps {
    query: UseQueryResult<ProjectReview[]>;
}

export function TeamsTab({query}: TeamsTabProps) {
    const {t} = useTranslation();

    const {
        data: allTeacherReviews = [],
        isPending: loadingTeams,
        isError: teamsError,
        refetch: refetchTeams
    } = query;

    return (
        <div className="adminTabContent">
            <div className="adminSectionActions">
                <h2 className="adminSectionHeading">{t('team_review_sections')}</h2>
            </div>

            <QueryState
                isPending={loadingTeams}
                isError={teamsError}
                onRetry={refetchTeams}
                errorMessageKey="failed_to_load_students"
            >
                {allTeacherReviews.length === 0 ? (
                    <p className="teacherEmptyState">{t('no_teams_found_search')}</p>
                ) : (
                    <div className="teamsList">
                        {allTeacherReviews.map((review, idx) => (
                            <div key={review.id || idx} className="teamCard">
                                <div className="teamCardTop">
                                    <span className="teamTag">Tím #{review.team?.id ?? idx + 1}</span>
                                </div>
                                <TeamMembersList
                                    members={review.team?.members ?? []}
                                    teamId={review.team?.id}
                                    onMemberRemoved={refetchTeams}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </QueryState>
        </div>
    );
}

export default TeamsTab;