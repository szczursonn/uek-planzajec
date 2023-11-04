import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { z } from 'zod';

interface SelectedSchedule {
    id: string;
    name: string;
}

export const usePickerSchedules = () => {
    const router = useRouter();

    const selectedSchedules: SelectedSchedule[] = useMemo(() => {
        let names: string[] = [];
        try {
            names = z.array(z.string()).parse(JSON.parse(router.query.names as unknown as string));
        } catch (err) {}

        if (router.query.id && typeof router.query.id === 'string') {
            return router.query.id.split(',').map((id, i) => ({
                id,
                name: names[i] ?? id,
            }));
        }

        return [];
    }, [router.query.id, router.query.names]);

    const generateQueryWithoutSchedule = (scheduleToRemove: SelectedSchedule) => {
        const newSelectedSchedules = selectedSchedules.filter(
            (group) => group.id !== scheduleToRemove.id,
        );

        return {
            id: newSelectedSchedules.map((group) => group.id).join(','),
            names: JSON.stringify(newSelectedSchedules.map((group) => group.name)),
        };
    };

    const generateQueryWithSchedule = (scheduleToAdd: SelectedSchedule) => {
        const newSelectedSchedules = [...selectedSchedules, scheduleToAdd];

        return {
            id: newSelectedSchedules.map((group) => group.id).join(','),
            names: JSON.stringify(newSelectedSchedules.map((group) => group.name)),
        };
    };

    return {
        selectedSchedules,
        generateQueryWithoutSchedule,
        generateQueryWithSchedule,
    } as const;
};
