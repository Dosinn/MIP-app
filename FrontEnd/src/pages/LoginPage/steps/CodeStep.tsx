import { useState } from 'react';
import OtpInput from '../components/OtpInput';
import { useTranslation } from 'react-i18next';
import '../LoginFlow.css';

interface CodeStepProps {
    email: string;
    onSubmit: (code: string) => Promise<void>;
    onResend: () => Promise<void>;
    onBack: () => void;
}

function CodeStep({ email, onSubmit, onResend, onBack }: CodeStepProps) {
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleVerify = async () => {
        if (code.length !== 6) {
            setError(t('code_step_validation_error'));
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await onSubmit(code);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('code_step_submit_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        await onResend();
        setResendCooldown(30);
        const timer = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className="loginForm">
            <button type="button" className="stepBackLink" onClick={onBack}>
                {t('code_step_change_email')}
            </button>

            <p className="stepTitle">{t('code_step_title')}</p>
            <p className="stepSubtitle">{t('code_step_subtitle')} <strong>{email}</strong></p>

            <OtpInput value={code} onChange={setCode} />

            {error && <p className="errorText" style={{ textAlign: 'center' }}>{error}</p>}

            <button
                type="button"
                className="loginButton"
                onClick={handleVerify}
                disabled={isLoading || code.length !== 6}
            >
                {isLoading ? t('verifying_btn_text') : t('confirm_btn_text')}
            </button>

            <button
                type="button"
                className="resendButton"
                onClick={handleResend}
                disabled={resendCooldown > 0}
            >
                {resendCooldown > 0 ? `${t('resend_btn_text')} (${resendCooldown}s)` : t('resend_code_btn_text')}
            </button>
        </div>
    );
}

export default CodeStep;