import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './NavBar.css';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type Notification } from '../../api/schemas/ProjectSchema.ts';
import Modal from '../Modal/Modal.tsx';
import { formatCommentDate } from '../../utils/formatDates.ts';
import formatName from '../../utils/formatName.ts';
import { useMyNotifications, useMarkNotificationAsRead } from '../../hooks/useNotifications.ts';

import { useAuth } from '../../context/AuthContext.tsx';
import UserAvatar from "../UserAvatar/UserAvatar.tsx";

interface NavBarProps {
    name?: string;
    hasNotifications?: boolean;
}

function NavBar({ name, hasNotifications = false }: NavBarProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);

    const displayName = name || user?.name.split(' ')[0] || '';

    const { data: notifications = [] } = useMyNotifications();
    const markAsReadMutation = useMarkNotificationAsRead();

    const hasUnread = notifications.some((n) => !n.isRead) || hasNotifications;

    const onCloseNotifications = () => {
        setShowNotifications(false);
    };

    const handleClick = (n: Notification) => {
        if (!n.isRead) {
            markAsReadMutation.mutate(n.id);
        }
        if (n.projectId) {
            navigate(`/project/${n.projectId}/manage`);
        }
        onCloseNotifications();
    };

    return (
        <nav className="navBar">
            <p className="greetingText">{t('greeting_text')},<br /><strong>{displayName}</strong>!</p>

            <div className="navbarRight">
                <button
                    type="button"
                    className="bellButton"
                    onClick={() => setShowNotifications(true)}
                    aria-label={t('notification_text')}
                >
                    <Bell size={28} strokeWidth={2} />
                    {hasUnread && <span className="notificationDot" />}
                </button>

                <UserAvatar name={user?.name || ''} size={48} onClick={() => navigate('/account')} />

            </div>

            {showNotifications && (
                <Modal title={t('notification_text')} onClose={onCloseNotifications}>
                    <div className="notifList">
                        {notifications.length === 0 ? (
                            <p className="commentsEmpty">{t('no_notifications_msg')}</p>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="commentItem"
                                    onClick={() => handleClick(notification)}
                                >
                                    <div className="commentBody">
                                        <p className="commentAuthor">
                                            {notification.status && (
                                                <span className={`notifStatusWord notifStatusWord--${notification.status}`}>
                                                    {t(`comment_status_word_${notification.status}`)}
                                                </span>
                                            )}{' '}
                                            {notification.teacher ? t('comment_by', { name: formatName(notification.teacher.name) }) : ''}
                                        </p>
                                        {notification.message && <p className="commentMessage">{notification.message}</p>}
                                        <p className="commentDate">{formatCommentDate(notification.date)}</p>
                                    </div>
                                    {!notification.isRead && <span className="notifListDot" />}
                                </div>
                            ))
                        )}
                    </div>
                </Modal>
            )}
        </nav>
    );
}

export default NavBar;
