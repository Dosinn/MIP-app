import UserAvatar from "../UserAvatar/UserAvatar.tsx";
import {UserMinus} from "lucide-react";
import ConfirmModal from "../ConfirmModal/ConfirmModal.tsx";
import {useState} from "react";
import type {User} from "../../api/schemas/PeopleSchema.ts";
import {useTranslation} from "react-i18next";
import {useRemoveTeamMember} from "../../hooks/useTeams.ts";
import {useToast} from "../Toast/ToastContext.tsx";
import getApiErrorMessage from "../../utils/errorHandler.ts";

interface TeamMembersListProps {
    members: User[];
    teamId: number | undefined;
    onMemberRemoved: () => void;
}

export function TeamMembersList({members, teamId, onMemberRemoved}: TeamMembersListProps) {
    const { showSuccess, showError } = useToast();
    const { t } = useTranslation();

    const removeMemberMutation = useRemoveTeamMember();

    const [memberToRemove, setMemberToRemove] = useState<{ teamId: number; member: User } | null>(null);

    const handleConfirmRemove = async () => {
        if (!memberToRemove) return;
        try {
            await removeMemberMutation.mutateAsync({ teamId: memberToRemove.teamId, userId: memberToRemove.member.id });
            showSuccess(t('member_removed_success'));
            onMemberRemoved();
        } catch (err) {
            showError(getApiErrorMessage(err));
        } finally {
            setMemberToRemove(null);
        }
    };


    return (
        <>
        <div className="teamMembersList">
            {members.length === 0 ? (
                <p className="noMembersText">{t('no_members_text')}</p>
            ) : (
                members.map((member) => (
                    <div key={member.id} className="teamMemberItem">
                        <UserAvatar name={member.name} size={46} />
                        <div className="teamMemberDetails">
                            <span className="teamMemberName">{member.name}</span>
                            {member.email && (
                                <span className="teamMemberEmail">{member.email}</span>
                            )}
                        </div>
                        {teamId && (
                            <button
                                type="button"
                                className="teamMemberRemoveBtn"
                                onClick={() => setMemberToRemove({ teamId, member })}
                                title={t('remove_member_from_team')}
                                disabled={removeMemberMutation.isPending}
                            >
                                <UserMinus size={18} />
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>

    <ConfirmModal
        isOpen={!!memberToRemove}
        title={t('remove_member_from_team')}
        message={memberToRemove ? t('confirm_remove_member_msg', { name: memberToRemove.member.name }) : ''}
        confirmText={t('remove_btn')}
        isDanger={true}
        loading={removeMemberMutation.isPending}
        onConfirm={handleConfirmRemove}
        onCancel={() => setMemberToRemove(null)}
    />
        </>
    );
}

export default TeamMembersList;