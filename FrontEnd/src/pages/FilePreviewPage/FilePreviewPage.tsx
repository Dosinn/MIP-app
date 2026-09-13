import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './FilePreviewPage.css';

function FilePreviewPage() {
    const { t } = useTranslation();
    const [params] = useSearchParams();

    const viewUrl     = params.get('url') ?? '';
    // const downloadUrl = params.get('download') ?? viewUrl;
    const fileName    = params.get('name') ?? t('file_preview_title', 'File');

    const isPdf = fileName.toLowerCase().endsWith('.pdf');

    // Dynamically allow pinch-to-zoom only on the file preview screen
    useEffect(() => {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const lockedContent = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=overlays-content';
        const zoomableContent = 'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover, interactive-widget=overlays-content';

        if (viewportMeta) {
            viewportMeta.setAttribute('content', zoomableContent);
        }

        return () => {
            if (viewportMeta) {
                viewportMeta.setAttribute('content', lockedContent);
            }
        };
    }, []);

    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.close();
        }
    };

    const openExternal = () =>
        window.open(viewUrl, '_blank', 'noopener,noreferrer');

    // const download = () => {
    //     const a = document.createElement('a');
    //     a.href = downloadUrl;
    //     a.download = fileName;
    //     document.body.appendChild(a);
    //     a.click();
    //     document.body.removeChild(a);
    // };

    return (
        <div className="filePreviewPage">
            {/* ── Header ── */}
            <div className="filePreviewHeader">
                <button
                    type="button"
                    className="filePreviewBack"
                    onClick={goBack}
                    aria-label={t('back')}
                >
                    <ArrowLeft size={24} />
                </button>

                <h1 className="filePreviewTitle" title={fileName}>{fileName}</h1>

                <div className="filePreviewHeaderActions">
                    <button
                        type="button"
                        className="filePreviewActionBtn"
                        onClick={openExternal}
                        title={t('open_in_new_tab')}
                    >
                        <ExternalLink size={18} />
                    </button>
                    {/*<button*/}
                    {/*    type="button"*/}
                    {/*    className="filePreviewActionBtn"*/}
                    {/*    onClick={download}*/}
                    {/*    title={t('download_file')}*/}
                    {/*>*/}
                    {/*    <Download size={18} />*/}
                    {/*</button>*/}
                </div>
            </div>

            {/* ── Viewer ── */}
            <div className="filePreviewBody">
                {isPdf ? (
                    <object
                        data={viewUrl}
                        type="application/pdf"
                        className="filePreviewObject"
                    >
                        <div className="filePreviewFallback">
                            <FileText size={64} />
                            <p>{t('pdf_fallback_hint')}</p>
                            <button
                                type="button"
                                className="filePreviewFallbackBtn"
                                onClick={openExternal}
                            >
                                <ExternalLink size={18} />
                                {t('open_in_new_tab')}
                            </button>
                        </div>
                    </object>
                ) : (
                    <div className="filePreviewFallback">
                        <FileText size={64} />
                        <p>{fileName}</p>
                        <button
                            type="button"
                            className="filePreviewFallbackBtn"
                            onClick={openExternal}
                        >
                            <ExternalLink size={18} />
                            {t('open_in_new_tab')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FilePreviewPage;
