import { getDateWithoutTimezone } from '@/lib/date';
import { useEffect, useReducer } from 'react';

const DATE_UPDATE_INTERVAL_MS = 60 * 1000; // 1min

let currentDate = getDateWithoutTimezone(new Date());

const callbacks = new Set<() => void>();
const refreshCurrentDate = () => {
    currentDate = getDateWithoutTimezone(new Date());
    callbacks.forEach((cb) => cb());
};

if ('window' in globalThis) {
    setInterval(refreshCurrentDate, DATE_UPDATE_INTERVAL_MS);
    window.onfocus = refreshCurrentDate;
}

export const useDebouncedCurrentDate = () => {
    const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

    useEffect(() => {
        callbacks.add(forceUpdate);
        return () => void callbacks.delete(forceUpdate);
    }, []);

    return currentDate;
};
