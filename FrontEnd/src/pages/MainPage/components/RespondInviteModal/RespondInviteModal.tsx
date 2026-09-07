import Modal from '../../../../components/Modal/Modal.tsx';
import { useTranslation } from 'react-i18next';
import type { TeamInvite } from '../../../../api/repositories/TeamRepository.ts';
import UserAvatar from '../../../../components/UserAvatar/UserAvatar.tsx';
import './RespondInviteModal.css';

interface ConfirmInviteModalProps {
    invite: TeamInvite;
    action: 'accept' | 'decline';
    isBusy: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function RespondInviteModal({ invite, action, isBusy, onConfirm, onCancel }: ConfirmInviteModalProps) {
    const { t } = useTranslation();
    const isAccept = action === 'accept';

    const title = isAccept
        ? t('confirm_accept_title')
        : t('confirm_decline_title');

    return (
        <Modal title={title} onClose={onCancel}>
            <div className="confirmInviteContent">
                <div className="confirmInviteUserRow">
                    <UserAvatar name={invite.invitedBy.name} size={40} />
                    <div className="inviteConfirmUserInfo">
                        <span className="confirmInviteUserName">{invite.invitedBy.name}</span>
                        {invite.invitedBy.email && (
                            <span className="confirmInviteUserEmail">{invite.invitedBy.email}</span>
                        )}
                    </div>
                </div>

                <p className="confirmInviteDescription">
                    {isAccept
                        ? t('confirm_accept_body', { name: invite.invitedBy.name })
                        : t('confirm_decline_body', { name: invite.invitedBy.name })}
                </p>

                <div className="confirmInviteActions">
                    <button
                        type="button"
                        className="confirmInviteCancelBtn"
                        onClick={onCancel}
                        disabled={isBusy}
                    >
                        {t('cancel_btn_text')}
                    </button>
                    <button
                        type="button"
                        className={isAccept ? 'confirmInviteAcceptBtn' : 'confirmInviteDeclineBtn'}
                        onClick={onConfirm}
                        disabled={isBusy}
                    >
                        {isBusy
                            ? t('saving_btn_text')
                            : isAccept
                            ? t('invite_accept_btn')
                            : t('invite_decline_btn')}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default RespondInviteModal;
