import {type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../LoginFlow.css';

interface EmailStepProps {
    onSubmit: (email: string) => Promise<void>;
}

function EmailStep({ onSubmit }: EmailStepProps) {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.endsWith('@stuba.sk')) {
            setError(t('email_step_validation_error'));
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(email);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('general_error_msg'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="loginForm" onSubmit={handleSubmit}>
            <p className="stepTitle">{t('email_step_title')}</p>
            <p className="stepSubtitle">{t('email_step_subtitle')}</p>

            <input
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="email@stuba.sk"
                className="loginInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
            />

            {error && <p className="errorText">{error}</p>}

            <button type="submit" className="loginButton" disabled={isLoading}>
                {isLoading ? t('sending_btn_text') : t('send_code_btn_text')}
            </button>

        </form>
    );
}

export default EmailStep;