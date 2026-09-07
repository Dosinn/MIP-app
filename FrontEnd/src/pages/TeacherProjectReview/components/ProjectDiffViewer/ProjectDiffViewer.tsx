import React, { useMemo } from 'react';
import {
    PlusCircle,
    MinusCircle,
    FileText,
    ArrowRight,
    CheckCircle2,
    Info,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './ProjectDiffViewer.css';
import type { HistoryElement } from '../../../../api/schemas/ProjectSchema.ts';


interface ProjectDiffViewerProps {
    currentText: string;
    previousText?: string | null;
    lastReturnedHistory?: HistoryElement | null;
}

interface WordToken {
    type: 'added' | 'removed' | 'unchanged';
    text: string;
}


// Word-level LCS diff algorithm for inline highlighting
function computeWordTokens(oldText: string, newText: string): WordToken[] {
    const oldWords = oldText.match(/\S+|\s+/g) || [];
    const newWords = newText.match(/\S+|\s+/g) || [];

    const n = oldWords.length;
    const m = newWords.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (oldWords[i - 1] === newWords[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    const tokens: WordToken[] = [];
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
            tokens.unshift({ type: 'unchanged', text: newWords[j - 1] });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            tokens.unshift({ type: 'added', text: newWords[j - 1] });
            j--;
        } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
            tokens.unshift({ type: 'removed', text: oldWords[i - 1] });
            i--;
        }
    }

    return tokens;
}

function countWords(str: string): number {
    return (str || '').trim().split(/\s+/).filter(Boolean).length;
}

export const ProjectDiffViewer: React.FC<ProjectDiffViewerProps> = ({
    currentText,
    previousText,
}) => {
    const { t } = useTranslation();

    // Check if snapshot is available
    const hasBaseline = previousText !== undefined && previousText !== null;
    const baseline = hasBaseline ? previousText : '';

    const isIdentical = hasBaseline && baseline.trim() === currentText.trim();

    // Compute Word-level inline tokens
    const wordTokens = useMemo(() => {
        if (!hasBaseline || isIdentical) return [];
        return computeWordTokens(baseline, currentText);
    }, [baseline, currentText, hasBaseline, isIdentical]);


    // Compute stats
    const stats = useMemo(() => {
        const oldWords = countWords(baseline);
        const newWords = countWords(currentText);

        let addedWordsCount = 0;
        let removedWordsCount = 0;

        wordTokens.forEach((tk) => {
            if (tk.type === 'added' && tk.text.trim()) {
                addedWordsCount += countWords(tk.text);
            } else if (tk.type === 'removed' && tk.text.trim()) {
                removedWordsCount += countWords(tk.text);
            }
        });

        return {
            added: addedWordsCount,
            removed: removedWordsCount,
            oldWords,
            newWords,
            wordDiff: newWords - oldWords,
        };
    }, [wordTokens, baseline, currentText]);

    return (
        <div className="projectDiffViewerContainer">

            {/* If no historical snapshot was stored yet */}
            {!hasBaseline ? (
                <div className="diffNoSnapshotBanner">
                    <Info size={18} className="diffInfoIcon" />
                    <div className="diffNoSnapshotBody">
                        <span className="diffNoSnapshotTitle">
                            {t('diff_snapshot_unavailable_title')}
                        </span>
                        <p className="diffNoSnapshotDesc">
                            {t('diff_snapshot_unavailable_desc')}
                        </p>
                    </div>
                </div>
            ) : isIdentical ? (
                /* If student has not yet edited the project since return */
                <div className="diffNoChangesCard">
                    <CheckCircle2 size={24} className="diffNoChangesIcon" />
                    <div className="diffNoChangesBody">
                        <span className="diffNoChangesTitle">
                            {t('diff_no_changes_title')}
                        </span>
                        <span className="diffNoChangesDesc">
                            {t('diff_no_changes_desc')}
                        </span>
                    </div>
                </div>
            ) : (
                /* Active Diff View with Stats and Inline Highlights */
                <>
                    {/* Stat Summary Bar */}
                    <div className="diffStatsBar">
                        <div className="diffStatsLeft">
                            <div className="diffStatBadge diffStatBadge--added">
                                <PlusCircle size={14} />
                                <span>
                                    +{stats.added} {t('diff_words_added')}
                                </span>
                            </div>
                            <div className="diffStatBadge diffStatBadge--removed">
                                <MinusCircle size={14} />
                                <span>
                                    -{stats.removed} {t('diff_words_removed')}
                                </span>
                            </div>
                        </div>

                        <div className="diffStatsRight">
                            <FileText size={14} className="diffWordIcon" />
                            <span className="diffWordCount">
                                {stats.oldWords} <ArrowRight size={12} className="diffArrow" />{' '}
                                {stats.newWords} {t('words_count_label')}
                                <span
                                    className={`diffWordDelta ${
                                        stats.wordDiff >= 0
                                            ? 'diffWordDelta--pos'
                                            : 'diffWordDelta--neg'
                                    }`}
                                >
                                    ({stats.wordDiff >= 0 ? `+${stats.wordDiff}` : stats.wordDiff})
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Inline Word Diff Preview */}
                    <div className="diffInlinePreviewBox">
                        <div className="diffInlinePreviewText">
                            {wordTokens.map((tk, idx) => {
                                if (tk.type === 'added') {
                                    return (
                                        <ins key={idx} className="diffWordIns">
                                            {tk.text}
                                        </ins>
                                    );
                                }
                                if (tk.type === 'removed') {
                                    return (
                                        <del key={idx} className="diffWordDel">
                                            {tk.text}
                                        </del>
                                    );
                                }
                                return <span key={idx}>{tk.text}</span>;
                            })}
                        </div>
                    </div>

                </>
            )}
        </div>
    );
};

export default ProjectDiffViewer;
