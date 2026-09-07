import { useEffect } from 'react';

export function useLockBodyScroll() {
    useEffect(() => {
        const original = document.body.style.overflowY;
        document.body.style.overflowY = 'hidden';

        return () => {
            document.body.style.overflowY = original;
        };
    }, []);
}