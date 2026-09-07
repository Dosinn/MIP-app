import { useState } from 'react';
import { Check, Clock } from 'lucide-react';
import './PersonPicker.css';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import type { User } from "../../api/schemas/PeopleSchema.ts";
import Modal from "../Modal/Modal.tsx";
import SearchBar from "../SearchBar/SearchBar.tsx";
import UserAvatar from "../UserAvatar/UserAvatar.tsx";

interface PersonPickerProps {
    title: string;
    searchPlaceholder: string;
    emptyMessage: string;
    people: User[];
    selectedIds: string[];
    pendingIds?: string[];
    onSelect: (person: User) => void;
    onClose: () => void;
}

function PersonPicker({
    title,
    searchPlaceholder,
    emptyMessage,
    people,
    selectedIds,
    pendingIds,
    onSelect,
    onClose,
}: PersonPickerProps) {
    const [query, setQuery] = useState('');

    useLockBodyScroll();

    const filtered = people.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.email ?? '').toLowerCase().includes(query.toLowerCase())
    );

    return (
        <Modal title={title} onClose={onClose}>
            <div className="personSearchWrapper">
                <SearchBar
                    onSearch={setQuery}
                    placeholder={searchPlaceholder}
                    className="personSearchBar"
                />
            </div>

                <div className="personList">
                    {filtered.length === 0 ? (
                        <p className="personEmpty">{emptyMessage}</p>
                    ) : (
                        filtered.map((person) => {

                            const isPending = pendingIds?.includes(String(person.id));
                            const isSelected = selectedIds.includes(String(person.id)) && !isPending;

                            return (
                                <button
                                    key={person.id}
                                    className="personOption"
                                    onClick={() => onSelect(person)}
                                    disabled={isSelected || isPending}
                                >
                                    <UserAvatar name={person.name} size={48} />
                                    <div className="personInfo">
                                        <span className="personName">{person.name}</span>
                                        {person.email && (
                                            <span className="personEmail">{person.email}</span>
                                        )}
                                    </div>
                                    {isSelected && <Check size={18} className="personCheck" />}
                                    {isPending && <Clock size={24} className="personCheck" />}
                                </button>
                            );
                        })
                    )}
                </div>
        </Modal>
    );
}

export default PersonPicker;