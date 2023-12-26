import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { scheduleTypeSchema } from '@/lib/uek';

const pickerState = z.array(
    z.object({
        id: z.string(),
        type: scheduleTypeSchema,
        label: z.string(),
    }),
);

export const usePickerState = () => {
    const router = useRouter();

    const state = useMemo(() => {
        let state: typeof pickerState._type = [];

        try {
            if (typeof router.query.state === 'string') {
                state = pickerState.parse(JSON.parse(router.query.state));
            }
        } catch (err) {}

        return state;
    }, [router.query.state]);

    return state;
};
