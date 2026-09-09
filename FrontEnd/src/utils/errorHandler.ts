import i18n from '../i18n.ts';
import { AxiosError } from 'axios';

export interface BackendErrorData {
    timestamp?: string;
    status?: number;
    error?: string;
    errorCode?: string;
    message?: string;
}

export function getApiErrorMessage(error: unknown, fallbackKey = 'general_error_msg'): string {
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosErr = error as AxiosError<BackendErrorData>;
        const errorCode = axiosErr.response?.data?.errorCode;
        if (errorCode) {
            const translationKey = `errors.${errorCode}`;
            if (i18n.exists(translationKey)) {
                return i18n.t(translationKey);
            }
        }
    }
    return i18n.t(fallbackKey);
}

export default getApiErrorMessage;
