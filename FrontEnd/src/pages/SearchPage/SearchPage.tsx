import {useState, useEffect, useRef} from "react";
import ProjectCardComponent from "../../components/ProjectCard/ProjectCard.tsx";
import SearchBar from "../../components/SearchBar/SearchBar.tsx";
import FilterChips from "../../components/SearchBar/FilterChips.tsx";
import QueryState from "../../components/QueryState/QueryState.tsx";
import {Loader} from "lucide-react";
import './SearchPage.css';
import {useInfiniteProjectsLibrary} from "../../hooks/useProjects.ts";
import {useCategories} from "../../hooks/useCategories.ts";
import {useTranslation} from "react-i18next";

function SearchPage() {
    const {t} = useTranslation();
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState<number[]>([]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
        }, 300);
        return () => clearTimeout(handler);
    }, [searchInput]);

    const {data: categories = []} = useCategories();
    const {
        data,
        isPending,
        isError,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteProjectsLibrary(debouncedSearch, activeFilters, 10);

    const projects = data?.pages.flatMap((page) => page.content) ?? [];

    const observerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const target = observerRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1, rootMargin: '250px' }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleFilterToggle = (categoryId: number) => {
        setActiveFilters((prev) =>
            prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
        );
    };

    if (isPending && !data) {
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
            <SearchBar onSearch={setSearchInput} placeholder={t('search_placeholder')}/>
            <FilterChips
                filters={categories}
                activeFilters={activeFilters}
                onFilterToggle={handleFilterToggle}
            />
            <div className="projectsContainer">
                {projects.length === 0 ? (
                    <p className="teacherEmptyState">{t('no_projects_found_msg')}</p>
                ) : (
                    <>
                        {projects.map((project) => (
                            <ProjectCardComponent key={project.id} project={project}/>
                        ))}
                        <div ref={observerRef} className="infiniteScrollSentinel">
                            {isFetchingNextPage && (
                                <div className="infiniteScrollLoading">
                                    <Loader className="queryStateSpinner" size={24} />
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default SearchPage;