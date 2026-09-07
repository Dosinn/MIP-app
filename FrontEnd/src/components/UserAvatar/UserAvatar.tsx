import React, { useMemo } from 'react';
import './UserAvatar.css';

interface UserAvatarProps {
    name: string;
    size?: number;
    className?: string;
    showTooltip?: boolean;
    onClick?: () => void;
}

const AVATAR_TEXT_COLORS = [
    '#1594C7',
    '#11769F',
    '#4E6E8E',
    '#0D5977',
];

function hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return Math.abs(hash);
}

function getInitial(name: string): string {
    const trimmed = (name || '').trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({name, size = 36, className = '', showTooltip = false, onClick}: UserAvatarProps) => {
    const initial = useMemo(() => getInitial(name), [name]);

    const textColor = useMemo(() => {
        const cleanName = (name || 'user').trim().toLowerCase();
        const index = hashString(cleanName) % AVATAR_TEXT_COLORS.length;
        return AVATAR_TEXT_COLORS[index];
    }, [name]);

    const fontSize = Math.round(size * 0.5);

    return (
        <div
            className={`userAvatarRoot ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                color: textColor,
                fontSize: `${fontSize}px`,
            }}
            title={showTooltip ? name : undefined}
            aria-label={name}
            onClick={onClick}
        >
            <span className="userAvatarText">{initial}</span>
        </div>
    );
};

export default UserAvatar;