import { z, type ZodSchema } from 'zod';

export const parseOrNull = <T extends ZodSchema>(z: T, value: unknown): T['_type'] | null => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return z.parse(value) as T['_type'];
    } catch (_) {
        return null;
    }
};

const transformNullishString = (value?: string | null | undefined) => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return value || null;
};

export const scheduleTypeSchema = z.enum(['G', 'N', 'S']);

export const scheduleSchema = z.object({
    type: scheduleTypeSchema,
    classicUrl: z.string().url(),
    header: z.object({
        title: z.string().min(1),
        moodleUrl: z.string().nullish().transform(transformNullishString),
    }),
    items: z.array(
        z.object({
            date: z.string().min(1),
            startTime: z.string().min(1),
            endTime: z.string().min(1),
            title: z.string().nullish().transform(transformNullishString),
            type: z.string().nullish().transform(transformNullishString),
            lecturer: z.string().nullish().transform(transformNullishString),
            lecturerUrl: z.string().url().nullish().transform(transformNullishString),
            location: z.string().nullish().transform(transformNullishString),
            comment: z.string().nullish().transform(transformNullishString),
            group: z.string().nullish().transform(transformNullishString),
        }),
    ),
});

export const scheduleHeaderSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    type: scheduleTypeSchema,
});

export const scheduleGroupSchema = z.object({
    type: scheduleTypeSchema,
    items: z.array(z.string()),
});

export type ScheduleHeader = typeof scheduleHeaderSchema._type;
export type Schedule = typeof scheduleSchema._type;
export type ScheduleGroup = typeof scheduleGroupSchema._type;
export type ScheduleType = typeof scheduleTypeSchema._type;
