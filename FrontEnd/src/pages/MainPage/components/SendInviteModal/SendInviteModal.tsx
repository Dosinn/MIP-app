import Modal from '../../../../components/Modal/Modal.tsx';
import { useTranslation } from 'react-i18next';
import type { User } from '../../../../api/schemas/PeopleSchema.ts';
import UserAvatar from '../../../../components/UserAvatar/UserAvatar.tsx';
import './SendInviteModal.css';

interface SendInviteModalProps {
    person: User;
    onConfirm: () => void;
    onClose: () => void;
}

function SendInviteModal({ person, onConfirm, onClose }: SendInviteModalProps) {
    const { t } = useTranslation();

    return (
        <Modal title={t('invite_confirm_title')} onClose={onClose}>
            <div className="inviteConfirmContent">

                <div className="inviteConfirmUserRow">
                    <UserAvatar name={person.name} size={48} />
                    <div className="inviteConfirmUserInfo">
                        <span className="inviteConfirmUserName">{person.name}</span>
                        {person.email && <span className="inviteConfirmUserEmail">{person.email}</span>}
                    </div>
                </div>

                <p className="inviteConfirmText">
                    {t('invite_confirm_text', { name: person.name })}
                </p>

                <div className="inviteConfirmActions">
                    <button type="button" className="inviteCancelBtn" onClick={onClose}>
                        {t('cancel_btn_text')}
                    </button>
                    <button type="button" className="inviteSubmitBtn" onClick={onConfirm}>
                        {t('send_invite_text')}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default SendInviteModal;