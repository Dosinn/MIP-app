import { useTranslation } from 'react-i18next';
import Modal from '../Modal/Modal.tsx';
import './ConfirmModal.css';

export interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({isOpen, title, message, confirmText, cancelText, isDanger = false, loading = false, onConfirm, onCancel}: ConfirmModalProps) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <Modal title={title || t('confirm_title')} onClose={onCancel}>
            <div className="confirmModalBody">
                <p className="confirmModalText">{message}</p>

                <div className="confirmModalActions">
                    <button
                        type="button"
                        className="cancelButton"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText || t('cancel_btn_text')}
                    </button>
                    <button
                        type="button"
                        className={isDanger ? 'rejectButton' : 'approveButton'}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? t('loading') : (confirmText || t('confirm_btn'))}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmModal;
