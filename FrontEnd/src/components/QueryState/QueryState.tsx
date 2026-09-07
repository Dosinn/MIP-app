import type { ReactNode } from 'react';
import { Loader, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './QueryState.css';

interface QueryStateProps {
    isPending: boolean;
    isError?: boolean;
    onRetry?: () => void;
    errorMessageKey?: string;
    errorMessage?: string;
    size?: 'page' | 'inline';
    children?: ReactNode;
}

function QueryState({
    isPending,
    isError = false,
    onRetry,
    errorMessageKey = 'generic_error_text',
    errorMessage,
    size = 'inline',
    children = null,
}: QueryStateProps) {
    const { t } = useTranslation();

    if (isPending) {
        return (
            <div className={`queryState ${size === 'page' ? 'queryStatePage' : 'queryStateInline'}`}>
                <Loader
                    size={size === 'page' ? 36 : 22}
                    className="queryStateSpinner"
                />
            </div>
        );
    }

    if (isError) {
        return (
            <div className={`queryState ${size === 'page' ? 'queryStatePage' : 'queryStateInline'}`}>
                <AlertTriangle size={size === 'page' ? 36 : 24} className="queryStateErrorIcon" />
                <p className="queryStateErrorText">{errorMessage || t(errorMessageKey)}</p>
                {onRetry && (
                    <button className="queryStateRetryButton" onClick={onRetry}>
                        {t('retry_btn_text')}
                    </button>
                )}
            </div>
        );
    }

    return <>{children}</>;
}

export default QueryState;