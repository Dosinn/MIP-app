import {Clock, Edit2, Plus} from "lucide-react";
import QueryState from "../../../components/QueryState/QueryState.tsx";
import {useCreateSection, useSections, useUpdateSection} from "../../../hooks/useSections.ts";
import type {ProjectSection} from "../../../api/schemas/FilesSchema.ts";
import {useState} from "react";
import Modal from "../../../components/Modal/Modal.tsx";
import DateRangePicker from "../../../components/DateRangePicker/DateRangePicker.tsx";
import {useTranslation} from "react-i18next";
import {useToast} from "../../../components/Toast/ToastContext.tsx";
import getApiErrorMessage from "../../../utils/errorHandler.ts";

export function SectionsTab() {

    const {t} = useTranslation();

    const {showSuccess, showError} = useToast();

    // Mutations
    const createSectionMutation = useCreateSection();
    const updateSectionMutation = useUpdateSection();

    // Section Modal State
    const [editingSection, setEditingSection] = useState<ProjectSection | null>(null);
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [sectionName, setSectionName] = useState('');
    const [sectionDesc, setSectionDesc] = useState('');
    const [sectionOrder, setSectionOrder] = useState(1);
    const [sectionStartsAt, setSectionStartsAt] = useState('');
    const [sectionEndsAt, setSectionEndsAt] = useState('');

    const {
        data: sections = [],
        isPending: loadingSections,
        isError: sectionsError,
        refetch: refetchSections
    } = useSections();

    const openCreateSection = () => {
        setEditingSection(null);
        setSectionName('');
        setSectionDesc('');
        setSectionOrder(sections.length + 1);
        setSectionStartsAt('');
        setSectionEndsAt('');
        setIsSectionModalOpen(true);
    };

    const openEditSection = (sec: ProjectSection) => {
        setEditingSection(sec);
        setSectionName(sec.name);
        setSectionDesc(sec.description || '');
        setSectionOrder(sec.orderIndex || 1);
        setSectionStartsAt(sec.startsAt ? sec.startsAt.substring(0, 16) : '');
        setSectionEndsAt(sec.endsAt ? sec.endsAt.substring(0, 16) : '');
        setIsSectionModalOpen(true);
    };

    const handleSaveSection = async () => {
        if (!sectionName.trim()) {
            showError(t('section_name_required'));
            return;
        }

        try {
            const payload = {
                name: sectionName.trim(),
                description: sectionDesc.trim() || undefined,
                orderIndex: Number(sectionOrder),
                startsAt: sectionStartsAt ? sectionStartsAt.substring(0, 19) : undefined,
                endsAt: sectionEndsAt ? sectionEndsAt.substring(0, 19) : undefined,
            };

            if (editingSection) {
                await updateSectionMutation.mutateAsync({id: editingSection.id, data: payload});
                showSuccess(t('section_updated_success'));
            } else {
                await createSectionMutation.mutateAsync(payload);
                showSuccess(t('section_created_success'));
            }
            setIsSectionModalOpen(false);
        } catch (err) {
            showError(getApiErrorMessage(err));
        }
    };

    return (
        <>
            <div className="adminTabContent">
                <div className="adminSectionActions">
                    <h2 className="adminSectionHeading">{t('file_submission_sections')}</h2>
                </div>
                <button type="button" className="adminAddBtn sectionBtn" onClick={openCreateSection}>
                    <Plus size={18}/>
                    <span>{t('add_section_btn')}</span>
                </button>

                <QueryState
                    isPending={loadingSections}
                    isError={sectionsError}
                    onRetry={refetchSections}
                    errorMessageKey="failed_to_load_sections"
                >
                    <div className="adminSectionsList">
                        {sections.map((sec) => {
                            const hasDates = sec.startsAt && sec.endsAt;
                            return (
                                <div key={sec.id} className="adminSectionCard">
                                    <div className="adminSectionCardHeader">
                                        <div className="adminSectionOrderBadge">{sec.orderIndex}</div>
                                        <div className="adminSectionHeaderInfo">
                                            <h3 className="adminSectionTitle">{sec.name}</h3>
                                            {sec.description && (
                                                <p className="adminSectionDescription">{sec.description}</p>
                                            )}
                                        </div>
                                        <div className="adminSectionControls">
                                            <button
                                                type="button"
                                                className="adminControlBtn"
                                                onClick={() => openEditSection(sec)}
                                                title={t('edit_section')}
                                            >
                                                <Edit2 size={16}/>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="adminSectionDatesRow">
                                        <div className="adminSectionDateItem">
                                            <Clock size={16}/>
                                            <span>
                                            {hasDates ? (
                                                <>
                                                    {new Date(sec.startsAt!).toLocaleDateString('sk-SK')} –{' '}
                                                    {new Date(sec.endsAt!).toLocaleDateString('sk-SK')}
                                                </>
                                            ) : (
                                                t('no_deadline_set')
                                            )}
                                        </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </QueryState>
            </div>

            {isSectionModalOpen && (
                <Modal
                    title={editingSection ? t('edit_section_title') : t('new_section_title')}
                    onClose={() => setIsSectionModalOpen(false)}
                >
                    <div className="adminModalForm">
                        <label className="adminFieldLabel">{t('section_name_label')}</label>
                        <input
                            type="text"
                            className="adminModalInput"
                            placeholder={t('section_name_placeholder')}
                            value={sectionName}
                            onChange={(e) => setSectionName(e.target.value)}
                        />

                        <label className="adminFieldLabel">{t('section_desc_label')}</label>
                        <textarea
                            className="adminModalTextarea"
                            rows={3}
                            placeholder={t('section_desc_placeholder')}
                            value={sectionDesc}
                            onChange={(e) => setSectionDesc(e.target.value)}
                        />

                        <label className="adminFieldLabel">{t('section_order_label')}</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min={1}
                            className="adminModalInput"
                            value={sectionOrder}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || /^[0-9]+$/.test(val)) {
                                    setSectionOrder(Number(val));
                                }
                            }}
                        />

                        <label className="adminFieldLabel">{t('section_deadline_calendar')}</label>
                        <DateRangePicker
                            startDate={sectionStartsAt}
                            endDate={sectionEndsAt}
                            onChange={(s, e) => {
                                setSectionStartsAt(s);
                                setSectionEndsAt(e);
                            }}
                        />

                        <div className="adminModalActions">
                            <button
                                type="button"
                                className="cancelButton"
                                onClick={() => setIsSectionModalOpen(false)}
                            >
                                {t('cancel_btn_text')}
                            </button>
                            <button
                                type="button"
                                className="adminSaveBtn"
                                onClick={handleSaveSection}
                                disabled={createSectionMutation.isPending || updateSectionMutation.isPending}
                            >
                                {t('save_btn_text')}
                            </button>
                        </div>

                        {/* TODO if we need this*/}
                        {/*{editingSection && (*/}
                        {/*    <button*/}
                        {/*        type="button"*/}
                        {/*        className="adminSaveBtn adminDeleteBtn"*/}
                        {/*        onClick={() => handleDeleteSection(Number(editingSection.id))}*/}
                        {/*        disabled={createSectionMutation.isPending || updateSectionMutation.isPending}*/}
                        {/*    >*/}
                        {/*        {t('delete_btn_text')}*/}
                        {/*    </button>*/}
                        {/*)}*/}

                    </div>
                </Modal>
            )}
        </>
    );
}

export default SectionsTab;