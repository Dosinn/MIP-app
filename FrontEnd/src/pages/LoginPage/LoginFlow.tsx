import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

import EmailStep from './steps/EmailStep';
import CodeStep from './steps/CodeStep';
import ProfileStep from './steps/ProfileStep';

import './LoginFlow.css';
import {useCompleteProfile, useRequestCode, useVerifyCode} from '../../hooks/useAuth.ts';
import {useToast} from '../../components/Toast/ToastContext.tsx';

import {useAuth} from '../../context/AuthContext.tsx';

type Step = 'email' | 'code' | 'profile';

function LoginFlow() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {showError} = useToast();
    const {user, login, refetchUser} = useAuth();

    const [step, setStep] = useState<Step>(() => {
        if (user && !user.onboarded) {
            return 'profile';
        }
        return 'email';
    });
    const [email, setEmail] = useState(() => user?.email ?? '');

    const requestCodeMutation = useRequestCode();
    const verifyCodeMutation = useVerifyCode();
    const completeProfileMutation = useCompleteProfile();

    const handleEmailSubmit = async (submittedEmail: string) => {
        try {
            await requestCodeMutation.mutateAsync(submittedEmail);
            setEmail(submittedEmail);
            setStep('code');
        } catch {
            showError(t('general_error_msg'));
        }
    };

    const handleCodeSubmit = async (code: string) => {
        try {
            const data = await verifyCodeMutation.mutateAsync({email, code});

            if (data.token) {
                await login(data.token);
            }

            const isOnboarded = Boolean(data.user?.onboarded);

            if (isOnboarded) {
                navigate('/');
                return;
            }

            setStep('profile');
        } catch {
            showError(t('code_step_submit_error'));
        }
    };

    const handleResendCode = async () => {
        try {
            await requestCodeMutation.mutateAsync(email);
        } catch {
            showError(t('general_error_msg'));
        }
    };

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

                {step === 'email' && <EmailStep onSubmit={handleEmailSubmit}/>}

                {step === 'code' && (
                    <CodeStep
                        email={email}
                        onSubmit={handleCodeSubmit}
                        onResend={handleResendCode}
                        onBack={() => setStep('email')}
                    />
                )}

                {step === 'profile' && <ProfileStep onSubmit={handleProfileSubmit}/>}

                {step === 'email' && (
                    <p className="helpText">
                        {t('login_help_problem')} <br/>{t('login_help_contact')}
                    </p>
                )}
            </div>
        </div>
    );
}

export default LoginFlow;