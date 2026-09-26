import {useState} from 'react';
import {useNavigate} from "react-router-dom"
import {useTranslation} from "react-i18next";

import type {LessonResponse, User} from "../../api/schemas/PeopleSchema.ts";
import {Clock, ExternalLink, Globe, Plus} from "lucide-react";

import QueryState from "../../components/QueryState/QueryState.tsx";
import {
    useAcceptInvite,
    useDeclineInvite,
    useInviteMember,
    useMyTeam,
    usePendingInvites,
    useSentPendingInvites
} from "../../hooks/useTeams.ts";
import {useSearchStudents} from "../../hooks/useUsers.ts";
import {useMyLessons} from "../../hooks/useLessons.ts";
import {useSections} from "../../hooks/useSections.ts";
import {useMyProject} from "../../hooks/useProjects.ts";
import {useToast} from "../../components/Toast/ToastContext.tsx";
import {getApiErrorMessage} from "../../utils/errorHandler.ts";
import type {TeamInvite} from "../../api/repositories/TeamRepository.ts";

import LessonItem from "../MainPage/components/LessonItem/LessonItem.tsx";
import UrgentDeadlines, {type Deadline} from "../MainPage/components/UrgentDeadlines/UrgentDeadlines.tsx";
import UserAvatar from "../../components/UserAvatar/UserAvatar.tsx";
import {ProjectCardAdd, ProjectCardComponent} from "../../components/ProjectCard/ProjectCard.tsx";
import PersonPicker from "../../components/PersonPicker/PersonPicker.tsx";
import SendInviteModal from "./components/SendInviteModal/SendInviteModal.tsx";
import RespondInviteModal from "./components/RespondInviteModal/RespondInviteModal.tsx";
import './MainPage.css';


function sortLessons(lessons: LessonResponse[]) {
    return lessons.sort((a, b) => {
        const aIsLecture = a.type?.toUpperCase() === "LECTURE" ? 0 : 1;
        const bIsLecture = b.type?.toUpperCase() === "LECTURE" ? 0 : 1;
        return aIsLecture - bIsLecture;
    });
}

function MainPage() {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const {showSuccess, showError} = useToast();

    const [showPicker, setShowPicker] = useState(false);
    const [searchStudentQuery, setSearchStudentQuery] = useState('');
    const [personToConfirm, setPersonToConfirm] = useState<User | null>(null);
    const [pendingInviteAction, setPendingInviteAction] = useState<{
        invite: TeamInvite;
        action: 'accept' | 'decline';
    } | null>(null);

    const {data: team, isPending: loadingTeam, isError: teamError, refetch: refetchTeam} = useMyTeam();
    const {data: myProject, isPending: loadingMyProject} = useMyProject();
    const {data: incomingInvites = []} = usePendingInvites();    // sent TO me
    const {data: sentInvites = []} = useSentPendingInvites();    // sent BY me
    const {data: searchStudents = []} = useSearchStudents(searchStudentQuery);
    const {data: lessons = [], isPending: loadingLessons} = useMyLessons();
    const {data: sections = []} = useSections();

    const inviteMutation = useInviteMember();
    const acceptMutation = useAcceptInvite();
    const declineMutation = useDeclineInvite();
    const isBusy = acceptMutation.isPending || declineMutation.isPending;

    const teamMembers: User[] = team?.members ?? [];
    const isFullTeam = teamMembers.length >= 4;

    const pendingIds = sentInvites.map((i) => String(i.invitedUser.id));

    const nowTime = new Date().getTime();
    const futureSections = sections
        .filter((s) => s.endsAt && new Date(s.endsAt).getTime() > nowTime)
        .sort((a, b) => new Date(a.endsAt!).getTime() - new Date(b.endsAt!).getTime());

    const earliestSection = futureSections[0];
    const deadline: Deadline | null = earliestSection
        ? {
            id: earliestSection.id,
            title: earliestSection.name,
            dueDate: earliestSection.endsAt!,
        }
        : null;

    const handlePickPerson = (person: User) => {
        setPersonToConfirm(person);
        setShowPicker(false);
    };

    const handleConfirmInvite = async () => {
        if (!personToConfirm) return;
        try {
            await inviteMutation.mutateAsync(personToConfirm.email || '');
            showSuccess(t('invite_sent_success'));
            setPersonToConfirm(null);
            setShowPicker(false);
        } catch (err) {
            showError(getApiErrorMessage(err));
        }
    };

    const handleAccept = async (invite: TeamInvite) => {
        try {
            await acceptMutation.mutateAsync(invite.inviteToken);
            showSuccess(t('invite_accepted_success'));
            refetchTeam();
        } catch (err) {
            showError(getApiErrorMessage(err));
        } finally {
            setPendingInviteAction(null);
        }
    };

    const handleDecline = async (invite: TeamInvite) => {
        try {
            await declineMutation.mutateAsync(invite.inviteToken);
            showSuccess(t('invite_declined_success'));
        } catch (err) {
            showError(getApiErrorMessage(err));
        } finally {
            setPendingInviteAction(null);
        }
    };

    const handleConfirmAction = () => {
        if (!pendingInviteAction) return;
        if (pendingInviteAction.action === 'accept') {
            handleAccept(pendingInviteAction.invite);
        } else {
            handleDecline(pendingInviteAction.invite);
        }
    };

    if (loadingTeam || teamError) {
        return (
            <QueryState
                isPending={loadingTeam}
                isError={teamError}
                onRetry={refetchTeam}
                errorMessageKey="failed_to_load_team"
                size="page"
            />
        );
    }

    return (
        <div className="mainPage">
            {deadline && (
                <div className="urgentSection">
                    <UrgentDeadlines deadline={deadline}/>
                </div>
            )}

            <a
                href="https://www2.fiit.stuba.sk/~lang/mip/"
                target="_blank"
                rel="noopener noreferrer"
                className="courseWebsiteCard"
            >
                <div className="courseWebsiteCardLeft">
                    <div className="courseWebsiteIconWrapper">
                        <Globe size={20} />
                    </div>
                    <span className="courseWebsiteTitle">{t('course_website_title')}</span>
                </div>
                <ExternalLink size={18} className="courseWebsiteExternalIcon" />
            </a>

            <div className="lessonsList">
                <h1 className="sectionText">{t('upcoming_classes')}</h1>
                {loadingLessons ? (
                    <QueryState isPending={true}/>
                ) : lessons.length > 0 ? (
                    sortLessons(lessons).map((lesson) => {
                        const isLecture = lesson.type?.toLowerCase() === 'lecture';
                        return (
                            <LessonItem
                                key={lesson.id}
                                weekday={lesson.dayOfWeek}
                                time={`${lesson.hour}:00`}
                                title={isLecture ? t('lecture_title_mip') : t('practice_title_mip')}
                                teacher={lesson.teacherName ?? ''}
                                room={lesson.room ?? ''}
                                type={lesson.type}
                            />
                        );
                    })
                ) : (
                    <p className="teacherEmptyState">{t('teacher_no_lessons_msg')}</p>
                )}
            </div>

            <div className="projectSection">
                <h1 className="sectionText">{t('your_projects_text')}</h1>
                {loadingMyProject ? (
                    <QueryState isPending={true}/>
                ) : myProject ? (
                    <ProjectCardComponent
                        project={myProject}
                        showStatus
                        onClick={() => navigate(`/project/${myProject.id}/manage`)}
                    />
                ) : (
                    <ProjectCardAdd onClick={() => navigate("/create-project")}/>
                )}

            </div>

            <div className="teamSection">
                <h1 className="sectionText">{t('your_team_text')}</h1>
                <div className="teamContainer">

                    {/* Confirmed team members */}
                    {teamMembers.map((user) => (
                        <div key={user.id} className="teamMember">
                            <UserAvatar name={user.name} size={48}/>
                            <div className="personInfo">
                                <span className="personName">{user.name}</span>
                                {user.email && (
                                    <span className="personEmail">{user.email}</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Outgoing pending invites */}
                    {sentInvites.map((invite) => (
                        <div key={`sent-${invite.id}`} className="teamMember teamMemberPending">
                            <UserAvatar name={invite.invitedUser.name} size={48}/>
                            <div className="personInfo">
                                <span className="personName">{invite.invitedUser.name}</span>
                                {invite.invitedUser.email && (
                                    <span className="personEmail">{invite.invitedUser.email}</span>
                                )}
                            </div>
                            <Clock size={24} className="pendingClockIcon"/>
                        </div>
                    ))}

                    {/* Team add btn */}
                    {!isFullTeam && (
                        <button type="button" className="teamMember teamMemberAdd" onClick={() => setShowPicker(true)}>
                            <div className="avatarCircleAdd">
                                <Plus size={22} strokeWidth={2}/>
                            </div>
                            <p className="memberName">{t('add_member_text')}</p>
                        </button>
                    )}

                    {/* Incoming invites */}
                    <div className="incomingInvitesList">
                        {incomingInvites.map((invite) => (
                            <div key={`incoming-${invite.id}`} className="teamMember teamMemberIncoming">
                                <UserAvatar name={invite.invitedBy.name} size={48}/>
                                <div className="personInfo">
                                    <span className="personName">{invite.invitedBy.name}</span>
                                    <span className="personEmail">{t('invite_from_subtext')}</span>
                                </div>
                                <div className="inlineInviteActions">
                                    <button
                                        className="inlineDeclineBtn"
                                        onClick={() => setPendingInviteAction({invite, action: 'decline'})}
                                        disabled={isBusy}
                                    >
                                        {t('invite_decline_btn')}
                                    </button>
                                    <button
                                        className="inlineAcceptBtn"
                                        onClick={() => setPendingInviteAction({invite, action: 'accept'})}
                                        disabled={isBusy}
                                    >
                                        {t('invite_accept_btn')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {showPicker && (
                <PersonPicker
                    title={t('add_member_text')}
                    searchPlaceholder={t('search_team_member_placeholder')}
                    emptyMessage={t('no_students_found_msg')}
                    people={searchStudents}
                    selectedIds={teamMembers.map((m) => String(m.id))}
                    pendingIds={pendingIds}
                    onSelect={handlePickPerson}
                    onClose={() => {
                        setShowPicker(false);
                        setSearchStudentQuery('');
                    }}
                />
            )}

            {personToConfirm && (
                <SendInviteModal
                    person={personToConfirm}
                    onConfirm={handleConfirmInvite}
                    onClose={() => setPersonToConfirm(null)}
                />
            )}

            {pendingInviteAction && (
                <RespondInviteModal
                    invite={pendingInviteAction.invite}
                    action={pendingInviteAction.action}
                    isBusy={isBusy}
                    onConfirm={handleConfirmAction}
                    onCancel={() => setPendingInviteAction(null)}
                />
            )}
        </div>
    );
}

export default MainPage;