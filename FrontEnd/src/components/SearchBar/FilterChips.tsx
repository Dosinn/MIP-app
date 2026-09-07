import './SearchBar.css';
import type { Category } from '../../api/schemas/ProjectSchema.ts';

interface FilterChipsProps {
    filters: Category[];
    activeFilters: number[];
    onFilterToggle: (categoryId: number) => void;
}

function FilterChips({ filters, activeFilters, onFilterToggle }: FilterChipsProps) {
    return (
        <div className="filterChips">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    type="button"
                    className={`chip ${activeFilters.includes(filter.id) ? 'chipActive' : ''}`}
                    onClick={() => onFilterToggle(filter.id)}
                >
                    {filter.name}
                </button>
            ))}
        </div>
    );
}
export default FilterChips;