import {useTranslation} from 'react-i18next';
import {CheckCircle2,} from 'lucide-react';
import Modal from '../../../../components/Modal/Modal.tsx';
import './AiTrustModal.css';

interface AiTrustModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AiTrustModal({isOpen, onClose}: AiTrustModalProps) {
    const {t} = useTranslation();

    if (!isOpen) return null;

    const dimensions = [
        {
            title: t('trust_dim_focus_title'),
            subtitle: t('trust_dim_focus_subtitle'),
            color: '#ea580c',
            desc: t('trust_dim_focus_desc'),
        },
        {
            title: t('trust_dim_audience_title'),
            subtitle: t('trust_dim_audience_subtitle'),
            color: '#0284c7',
            desc: t('trust_dim_audience_desc'),
        },
        {
            title: t('trust_dim_alignment_title'),
            subtitle: t('trust_dim_alignment_subtitle'),
            color: '#2563eb',
            desc: t('trust_dim_alignment_desc'),
        },
        {
            title: t('trust_dim_uniqueness_title'),
            subtitle: t('trust_dim_uniqueness_subtitle'),
            color: '#8b5cf6',
            desc: t('trust_dim_uniqueness_desc'),
        },
        {
            title: t('trust_dim_evidence_title'),
            subtitle: t('trust_dim_evidence_subtitle'),
            color: '#16a34a',
            desc: t('trust_dim_evidence_desc'),
        },
    ];

    return (
        <Modal
            title={t('ai_trust_modal_title')}
            onClose={onClose}
        >
            <div className="aiTrustHero">
                <div className="aiTrustHeroText">
                    <h4 className="aiTrustHeroTitle">
                        {t('ai_trust_hero_title')}
                    </h4>
                    <p className="aiTrustHeroDesc">
                        {t('ai_trust_hero_desc')}
                    </p>
                </div>
            </div>

            <div className="aiTrustDimensionsList">
                <h5 className="aiTrustSectionHeading">
                    <span>{t('ai_trust_radar_heading')}</span>
                </h5>

                {dimensions.map((dim, idx) => (
                    <div key={idx} className="aiTrustDimCard">
                        <div className="aiTrustDimBody">
                            <div className="aiTrustDimHeader">
                                <span className="aiTrustDimTitle" style={{color: dim.color}}>{dim.title}</span>
                                <span className="aiTrustDimSubtitle">{dim.subtitle}</span>
                            </div>
                            <p className="aiTrustDimDesc">{dim.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="aiTrustFooterNotice">
                <div className="aiTrustNoticeItem">
                    <CheckCircle2 size={16} className="aiTrustCheckIcon"/>
                    <span>
                        {t('ai_trust_deterministic_note')} {t('ai_trust_privacy_note')}
                    </span>
                </div>
            </div>

            <div className="aiTrustModalActions">
                <button type="button" className="aiTrustCloseBtn" onClick={onClose}>
                    {t('understand_btn')}
                </button>
            </div>
        </Modal>
    );
}

export default AiTrustModal;
