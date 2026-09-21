import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/apiClient';
import './FilePreviewPage.css';

function FilePreviewPage() {
    const { t } = useTranslation();
    const [params] = useSearchParams();

    const viewUrl     = params.get('url') ?? '';
    const downloadUrl = params.get('download') || viewUrl;
    const fileName    = params.get('name') ?? t('file_preview_title', 'File');
    const [isDownloading, setIsDownloading] = useState(false);

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

    const handleDownload = async () => {
        if (!downloadUrl || isDownloading) return;
        setIsDownloading(true);
        try {
            const response = await apiClient.get(downloadUrl, {
                responseType: 'blob',
                headers: {
                    Accept: 'application/pdf',
                },
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
                document.body.removeChild(a);
            }, 1000);
        } catch (err) {
            console.error('Blob download failed, falling back to direct link:', err);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } finally {
            setIsDownloading(false);
        }
    };

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
                        onClick={handleDownload}
                        disabled={isDownloading}
                        title={t('download_file', 'Download file')}
                    >
                        {isDownloading ? <Loader2 size={18} className="filePreviewSpinner" /> : <Download size={18} />}
                    </button>
                </div>
            </div>

            {/* ── Viewer ── */}
            <div className="filePreviewBody">
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
                            onClick={handleDownload}
                            disabled={isDownloading}
                        >
                            {isDownloading ? <Loader2 size={18} className="filePreviewSpinner" /> : <Download size={18} />}
                            <span>{t('download_file', 'Download file')}</span>
                        </button>
                    </div>
                </object>
            </div>
        </div>
    );
}

export default FilePreviewPage;
