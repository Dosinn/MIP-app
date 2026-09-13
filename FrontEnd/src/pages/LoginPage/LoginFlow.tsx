import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useGoogleLogin} from '@react-oauth/google';

import ProfileStep from './steps/ProfileStep';
import './LoginFlow.css';
import {useCompleteProfile, useGoogleLogin as useGoogleLoginMutation} from '../../hooks/useAuth.ts';
import {useToast} from '../../components/Toast/ToastContext.tsx';
import {useAuth} from '../../context/AuthContext.tsx';
import {getApiErrorMessage} from '../../utils/errorHandler.ts';

type Step = 'login' | 'profile';

function LoginFlow() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {showError} = useToast();
    const {user, login, refetchUser} = useAuth();

    const [step, setStep] = useState<Step>(() => {
        if (user && !user.onboarded) {
            return 'profile';
        }
        return 'login';
    });
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    const googleLoginMutation = useGoogleLoginMutation();
    const completeProfileMutation = useCompleteProfile();

    const triggerGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoginError(null);
            try {
                setIsLoggingIn(true);
                const data = await googleLoginMutation.mutateAsync(tokenResponse.access_token);
                if (data.token) {
                    await login(data.token);
                }
                const isOnboarded = Boolean(data.user?.onboarded);
                if (isOnboarded) {
                    navigate('/');
                    return;
                }
                setStep('profile');
            } catch (err) {
                const msg = getApiErrorMessage(err, 'Prihlásenie cez Google zlyhalo');
                setLoginError(msg);
                showError(msg);
            } finally {
                setIsLoggingIn(false);
            }
        },
        onError: () => {
            const msg = t('general_error_msg');
            setLoginError(msg);
            showError(msg);
        }
    });

    const handleProfileSubmit = async (name: string, teacherId: string) => {
        try {
            await completeProfileMutation.mutateAsync({name, teacherId});
            await refetchUser();

            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }

            navigate('/');
        } catch {
            showError(t('general_error_msg'));
        }
    };

    return (
        <div className="loginPage">
            <div className="loginCard">
                <img src="/favicon-inverse.svg" alt="MIP" className="loginLogo"/>

                {step === 'login' && (
                    <div className="googleLoginContainer">
                        <p className="stepTitle">{t('email_step_title')}</p>
                        <p className="stepSubtitle">{t('login_welcome_subtitle')}</p>

                        <button
                            type="button"
                            className="googleCustomButton"
                            onClick={() => triggerGoogleLogin()}
                            disabled={isLoggingIn}
                        >
                            <svg className="googleIcon" viewBox="0 0 24 24" width="20" height="20">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                            </svg>
                            <span>{isLoggingIn ? t('verifying_btn_text') : (t('login_with_google') || 'Prihlásiť sa cez Google')}</span>
                        </button>

                        {loginError && <p className="errorText loginErrorText">{loginError}</p>}
                    </div>
                )}

                {step === 'profile' && <ProfileStep onSubmit={handleProfileSubmit}/>}

                {step === 'login' && (
                    <p className="helpText">
                        {t('login_help_problem')} <br/>{t('login_help_contact')}
                    </p>
                )}
            </div>
        </div>
    );
}

export default LoginFlow;