import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import './Toast.css';

export type ToastType = 'error' | 'success' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
    showError: (message: string) => void;
    showSuccess: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, message }]);

        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);

    const showError = useCallback((message: string) => {
        showToast(message, 'error');
    }, [showToast]);

    const showSuccess = useCallback((message: string) => {
        showToast(message, 'success');
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, showError, showSuccess }}>
            {children}
            <div className="toastContainer" aria-live="polite">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toastItem toast--${toast.type}`}>
                        <div className="toastIcon">
                            {toast.type === 'error' && <AlertCircle size={20} />}
                            {toast.type === 'success' && <CheckCircle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                        </div>
                        <span className="toastText">{toast.message}</span>
                        <button
                            type="button"
                            className="toastClose"
                            onClick={() => removeToast(toast.id)}
                            aria-label="Close notification"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}


