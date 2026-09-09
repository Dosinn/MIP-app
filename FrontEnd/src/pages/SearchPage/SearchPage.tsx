import {useState} from "react";
import ProjectCardComponent from "../../components/ProjectCard/ProjectCard.tsx";
import SearchBar from "../../components/SearchBar/SearchBar.tsx";
import FilterChips from "../../components/SearchBar/FilterChips.tsx";
import QueryState from "../../components/QueryState/QueryState.tsx";
import './SearchPage.css';
import {useProjectsLibrary} from "../../hooks/useProjects.ts";
import {useCategories} from "../../hooks/useCategories.ts";
import {useTranslation} from "react-i18next";

function SearchPage() {
    const {t} = useTranslation();
    const [search, setSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState<number[]>([]);

    const {data: categories = []} = useCategories();
    const {data: projects = [], isPending, isError, refetch} = useProjectsLibrary(search, activeFilters);

    const handleFilterToggle = (categoryId: number) => {
        setActiveFilters((prev) =>
            prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
        );
    };

    if (isPending || isError) {
        return (
            <QueryState
                isPending={isPending}
                isError={isError}
                onRetry={refetch}
                errorMessageKey="failed_to_load_project"
                size="page"
            />
        );
    }

    return (
        <div className="searchPage">
            <SearchBar onSearch={setSearch} placeholder={t('search_placeholder')}/>
            <FilterChips
                filters={categories}
                activeFilters={activeFilters}
                onFilterToggle={handleFilterToggle}
            />
            <div className="projectsContainer">
                {projects.length === 0 ? (
                    <p className="teacherEmptyState">{t('no_projects_found_msg')}</p>
                ) : (
                    projects.map((project) => (
                        <ProjectCardComponent key={project.id} project={project}/>
                    ))
                )}
            </div>
        </div>
    );
}

export default SearchPage;