import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Calendar, Clock, GraduationCap, Users,} from 'lucide-react';

import './AdminPage.css';
import '../TeacherStudentsPage/TeacherStudentsPage.css';

import SectionsTab from "./components/SectionsTab.tsx";
import TeachersTab from "./components/TeachersTab.tsx";
import LessonsTab from "./components/LessonsTab.tsx";
import TeamsTab from "./components/TeamsTab.tsx";
import {useTeachers} from "../../hooks/useUsers.ts";
import {useAllLessons} from "../../hooks/useLessons.ts";
import {useTeacherAllReviews} from "../../hooks/useProjects.ts";

type AdminTab = 'sections' | 'teachers' | 'teams' | 'lessons';

function AdminPage() {
    const {t} = useTranslation();

    const [activeTab, setActiveTab] = useState<AdminTab>('sections');

    const teachersQuery = useTeachers();
    const lessonsQuery = useAllLessons();
    const teamsQuery = useTeacherAllReviews();

    const teachers = teachersQuery.data ?? [];
    const allLessons = lessonsQuery.data ?? [];
    const allTeacherReviews = teamsQuery.data ?? [];

    return (
        <div className="adminPage">
            <div className="teacherStudentsHeader">
                <h1 className="teacherStudentsTitle">{t('admin_control_panel')}</h1>
            </div>

            {/* Main Tabs Navigation */}
            <div className="adminTabsBar">
                <button
                    type="button"
                    className={`sessionTab adminTabBtn ${activeTab === 'sections' ? 'sessionTabActive' : ''}`}
                    onClick={() => setActiveTab('sections')}
                >
                    <Calendar size={16}/>
                    <span>{t('admin_tab_sections')}</span>
                </button>

                <button
                    type="button"
                    className={`sessionTab adminTabBtn ${activeTab === 'teachers' ? 'sessionTabActive' : ''}`}
                    onClick={() => setActiveTab('teachers')}
                >
                    <GraduationCap size={16}/>
                    <span>{t('teachers_tab')} ({teachers.length})</span>
                </button>

                <button
                    type="button"
                    className={`sessionTab adminTabBtn ${activeTab === 'lessons' ? 'sessionTabActive' : ''}`}
                    onClick={() => setActiveTab('lessons')}
                >
                    <Clock size={16}/>
                    <span>{t('admin_tab_lessons')} ({allLessons.length})</span>
                </button>

                <button
                    type="button"
                    className={`sessionTab adminTabBtn ${activeTab === 'teams' ? 'sessionTabActive' : ''}`}
                    onClick={() => setActiveTab('teams')}
                >
                    <Users size={16}/>
                    <span>{t('teams_tab')} ({allTeacherReviews.length})</span>
                </button>
            </div>

            {activeTab === 'sections' && (
                <SectionsTab/>
            )}

            {activeTab === 'teachers' && (
                <TeachersTab query={teachersQuery}/>
            )}

            {activeTab === 'lessons' && (
                <LessonsTab teachersQuery={teachersQuery} lessonsQuery={lessonsQuery}/>
            )}

            {activeTab === 'teams' && (
                <TeamsTab query={teamsQuery}/>
            )}
        </div>
    );
}

export default AdminPage;