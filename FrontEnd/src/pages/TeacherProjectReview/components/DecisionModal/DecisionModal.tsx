import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './DecisionModal.css';
import Modal from "../../../../components/Modal/Modal.tsx";

interface DecisionModalProps {
    decision: 'approved' | 'rejected';
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isSubmitting: boolean;
}

function DecisionModal({ decision, onClose, onConfirm, isSubmitting }: DecisionModalProps) {
    const { t } = useTranslation();
    const [reason, setReason] = useState('');
    const isReject = decision === 'rejected';

    const modalTitle = isReject ? t('decision_reject_title') : t('decision_approve_title')

    return (
        <Modal title={modalTitle} onClose={onClose}>

            <textarea
                className="decisionTextArea"
                placeholder={isReject ? t('decision_reject_placeholder') : t('decision_approve_placeholder')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
            />

            <div className="decisionModalActions">
                <button className="cancelButton" onClick={onClose} disabled={isSubmitting}>
                    {t('cancel_btn_text')}
                </button>
                <button
                    className={isReject ? 'rejectButton' : 'approveButton'}
                    onClick={() => onConfirm(reason)}
                >
                    {isReject ? t('reject_btn_text') : t('approve_btn_text')}
                </button>
            </div>

        </Modal>
    );
}

export default DecisionModal;