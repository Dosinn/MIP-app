import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './PWAGatekeeper.css';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAGatekeeperProps {
    children: React.ReactNode;
}

const checkIsStandalone = (): boolean => {
    if (typeof window === 'undefined') return false;

    const isMediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isNavStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isAndroidApp = document.referrer?.includes('android-app://');

    return Boolean(isMediaStandalone || isNavStandalone || isAndroidApp);
};

const checkIsIOS = (): boolean => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

    const userAgent = navigator.userAgent ?? '';
    const platform = navigator.platform ?? '';

    return (
        /iPad|iPhone|iPod/.test(userAgent) ||
        (platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1)
    );
};

export const PWAGatekeeper: React.FC<PWAGatekeeperProps> = ({ children }) => {
    const { t } = useTranslation();
    const [isStandalone, setIsStandalone] = useState<boolean>(checkIsStandalone);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isIOS] = useState<boolean>(checkIsIOS);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for display-mode changes if user launches installed app
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleMediaChange = (e: MediaQueryListEvent) => {
            if (e.matches) {
                setIsStandalone(true);
            }
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleMediaChange);
        } else {
            mediaQuery.addListener(handleMediaChange);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleMediaChange);
            } else {
                mediaQuery.removeListener(handleMediaChange);
            }
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsStandalone(true);
                try {
                    localStorage.setItem('pwa_bypass', 'true');
                } catch {
                    // ignore storage errors
                }
            }
        } catch (err) {
            console.error('PWA install prompt error:', err);
        } finally {
            setDeferredPrompt(null);
        }
    };

    if (isStandalone) {
        return <>{children}</>;
    }

    return (
        <div className="pwaGatekeeperPage">
            <div className="pwaGatekeeperCard">
                <img src="/favicon-inverse.svg" alt="MIP" className="pwaGatekeeperLogo" />

                <h1 className="pwaTitle">{t('pwa_gatekeeper_title')}</h1>
                <p className="pwaDescription">{t('pwa_gatekeeper_desc')}</p>

                <div className="pwaActionArea">
                    {deferredPrompt && (
                        <button
                            type="button"
                            className="pwaInstallButton"
                            onClick={handleInstallClick}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>{t('pwa_gatekeeper_install_btn')}</span>
                        </button>
                    )}

                    {isIOS && !deferredPrompt && (
                        <div className="pwaIosInstructions">
                            <div className="pwaIosStep">
                                <span className="pwaIosIcon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                                        <polyline points="16 6 12 2 8 6"></polyline>
                                        <line x1="12" y1="2" x2="12" y2="15"></line>
                                    </svg>
                                </span>
                                <span>{t('pwa_gatekeeper_ios_step1')}</span>
                            </div>
                            <div className="pwaIosStep">
                                <span className="pwaIosIcon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="12" y1="8" x2="12" y2="16"></line>
                                        <line x1="8" y1="12" x2="16" y2="12"></line>
                                    </svg>
                                </span>
                                <span>{t('pwa_gatekeeper_ios_step2')}</span>
                            </div>
                        </div>
                    )}

                    {!deferredPrompt && !isIOS && (
                        <div className="pwaDesktopHint">
                            {t('pwa_gatekeeper_desktop_hint')}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PWAGatekeeper;
