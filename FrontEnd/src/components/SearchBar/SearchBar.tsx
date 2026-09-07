import { useState } from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';
import { useTranslation } from "react-i18next";

interface SearchBarProps {
    onSearch: (value: string) => void;
    placeholder?: string;
    className?: string;
}

function SearchBar({ onSearch, placeholder, className }: SearchBarProps) {
    const [value, setValue] = useState('');
    const { t } = useTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <div className={`searchBar ${className ?? ''}`}>
            <Search className="searchIcon" size={22} strokeWidth={1.8} />
            <input
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={value}
                onChange={handleChange}
                placeholder={placeholder ?? t('search_placeholder')}
                className="searchInput"
            />
        </div>
    );
}

export default SearchBar;