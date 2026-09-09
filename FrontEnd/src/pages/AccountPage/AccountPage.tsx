import {useNavigate} from 'react-router-dom';
import {useTheme} from '../../context/ThemeContext.tsx';
import {Check, ChevronRight, LogOut, Moon, Sun} from 'lucide-react';
import {useTranslation} from "react-i18next";
import {useState} from "react";

import './AccountPage.css';
import Modal from "../../components/Modal/Modal.tsx";
import {useAuth} from '../../context/AuthContext.tsx';
import UserAvatar from "../../components/UserAvatar/UserAvatar.tsx";

const LANGUAGES = [
    {code: 'sk', label: 'Slovenčina', flag: '🇸🇰'},
    {code: 'en', label: 'English', flag: '🇬🇧'},
] as const;

function AccountPage() {
    const navigate = useNavigate();
    const {i18n, t} = useTranslation();
    const {user, logout} = useAuth();


    const [showLangModal, setShowLangModal] = useState(false);

    const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

    const handleSelect = (code: string) => {
        i18n.changeLanguage(code);
        localStorage.setItem('language', code);
        setShowLangModal(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const {resolvedTheme, setTheme} = useTheme();

    const handleThemeToggle = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    const displayName = user?.name ?? '';
    const displayEmail = user?.email ?? '';

    return (
        <div className="accountPage">
            <div className="accountHeader">
                <UserAvatar name={displayName} size={72}/>
                <p className="accountName">{displayName}</p>
                <p className="accountEmail">{displayEmail}</p>
            </div>

            <div className="accountMenu">
                <button className="menuItem" onClick={() => navigate('/saved')}>
                    <span>{t('account_saved_projects_text')}</span>
                    <ChevronRight size={18}/>
                </button>

                <button className="menuItem" onClick={() => navigate('/archived')}>
                    <span>{t('account_archived_projects_text')}</span>
                    <ChevronRight size={18}/>
                </button>

                <button className="menuItem" onClick={() => setShowLangModal(true)}>
                    <span className="menuItemWithIcon">
                        {t('account_change_language_text')}
                    </span>
                    <span className="menuItemRight">
                        <span className="currentLangLabel">
                            {currentLang.label}
                        </span>
                        <ChevronRight size={18}/>
                    </span>
                </button>

                <button className="menuItem" onClick={handleThemeToggle}>
                    <span className="menuItemWithIcon">
                        {t('account_change_theme_text')}
                    </span>
                    <span className="menuItemRight">
                        {resolvedTheme === 'dark' ? <Moon size={18}/> : <Sun size={18}/>}
                    </span>
                </button>
            </div>

            <button className="logoutButton" onClick={handleLogout}>
                <LogOut size={18}/>
                {t('account_logout_text')}
            </button>

            {showLangModal && (
                <Modal title={t('choose_language_title')} onClose={() => setShowLangModal(false)}>
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            className="langOption"
                            onClick={() => handleSelect(lang.code)}
                        >
                            <span className="langFlag">{lang.flag}</span>
                            <span className="langLabel">{lang.label}</span>
                            {i18n.language === lang.code && (
                                <Check size={24} className="langCheck"/>
                            )}
                        </button>
                    ))}
                </Modal>
            )}
        </div>
    );
}

export default AccountPage;