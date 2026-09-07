import { useState, useEffect, useRef } from 'react';
import {fastApiClient} from "../api/apiClient.ts";

interface DraftResult {
    point: { x: number; y: number } | null;
    neighbors: { targetId: number; strength: number }[];
}

export function useDraftPosition(title: string, description: string, delay = 500) {
    const [result, setResult] = useState<DraftResult>({ point: null, neighbors: [] });
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const text = `${title} ${description}`.trim();
        if (text.length < 5) {
            setResult({ point: null, neighbors: [] });
            return;
        }

        timeoutRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const r = await fastApiClient.post('/similarity/preview', {
                    title,
                    description,
                });
                setResult(r.data);
            } catch (err) {
                console.error('Draft position fetch failed', err);
            } finally {
                setLoading(false);
            }
        }, delay);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [title, description, delay]);

    return { ...result, loading };
}