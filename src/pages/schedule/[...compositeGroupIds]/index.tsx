import { useState } from 'react';
import { type GetServerSideProps, type InferGetServerSidePropsType } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { scheduleTypeSchema, type Schedule, getSchedule } from '@/lib/uek';
import ScheduleContainer from '@/components/schedule/ScheduleContainer';
import Select from '@/components/Select';
import DocumentTitle from '@/components/DocumentTitle';

const paramsSchema = z.object({
    period: z.string().optional().default('1'),
    view: z.string().optional().default('agenda'),
});

const compositeGroupId = z
    .string()
    .regex(/^[A-Z]\d{1,6}$/)
    .transform((id) => ({
        type: scheduleTypeSchema.parse(id.substring(0, 1)),
        id: id.substring(1),
    }));

export default function SchedulePage({
    schedules,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [isPeriodPickerDisabled, setIsPeriodPickerDisabled] = useState(false);
    const router = useRouter();

    const currentPeriodId = String(router.query.period ?? '1');
    const currentView = String(router.query.view ?? 'agenda');

    return (
        <div className='sm:mx-[5vw]'>
            <DocumentTitle title={schedules.map((schedule) => schedule.label).join(', ')} />
            <span className='flex gap-2 items-center'>
                <h2>{schedules.map((schedule) => schedule.label).join(', ')}</h2>

                <Link
                    className='dark:hover:text-zinc-300'
                    href={{
                        pathname: '/pick',
                        query: {
                            state: JSON.stringify(
                                schedules.map((schedule) => ({
                                    id: schedule.id,
                                    type: schedule.type,
                                    label: schedule.label,
                                })),
                            ),
                        },
                    }}
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        height='20'
                        stroke='currentColor'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        viewBox='0 0 24 24'
                        width='20'
                        aria-hidden
                    >
                        <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
                        <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
                    </svg>
                    <span className='sr-only'>Wybierz</span>
                </Link>
            </span>

            <form action='' method='GET' className='my-2 flex flex-row gap-2 max-w-xl'>
                <Select
                    name='period'
                    disabled={isPeriodPickerDisabled}
                    value={currentPeriodId}
                    onSelect={(newPeriodId) => {
                        if (newPeriodId && newPeriodId !== currentPeriodId) {
                            setIsPeriodPickerDisabled(true);

                            void router
                                .replace({
                                    pathname: router.pathname,
                                    query: {
                                        ...router.query,
                                        period: newPeriodId,
                                    },
                                })
                                .then(() => {
                                    setIsPeriodPickerDisabled(false);
                                });
                        }
                    }}
                >
                    {schedules[0]?.periods.map((period) => (
                        <Select.Option key={period.id} value={period.id} label={period.label} />
                    ))}
                </Select>
                <Select
                    name='view'
                    disabled={isPeriodPickerDisabled}
                    value={currentView}
                    onSelect={(newView) => {
                        if (newView && newView !== currentView) {
                            void router.replace(
                                {
                                    pathname: router.pathname,
                                    query: {
                                        ...router.query,
                                        view: newView,
                                    },
                                },
                                undefined,
                                {
                                    shallow: true,
                                },
                            );
                        }
                    }}
                >
                    <Select.Option value='agenda' label='Harmonogram' />
                    <Select.Option value='week' label='Tydzień' />
                </Select>
                <noscript>
                    <button
                        type='submit'
                        className='focus-visible:outline-none rounded-lg mt-2 bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm block w-16 p-2.5 dark:bg-zinc-950 dark:border-zinc-800 dark:placeholder-zinc-400 dark:text-white'
                    >
                        OK
                    </button>
                </noscript>
            </form>

            <hr className='border-gray-400 dark:border-zinc-700 border-t-2 my-2' />

            <ScheduleContainer schedules={schedules} view={currentView} />

            <hr className='border-gray-400 dark:border-zinc-700 border-t-2 my-2' />

            <h3>{schedules.length === 1 ? 'Oryginalny plan zajęć' : 'Oryginalne plany zajęć'}</h3>
            <ul>
                {schedules.map((schedule) => (
                    <li key={schedule.id}>
                        <Link
                            href={`https://planzajec.uek.krakow.pl/index.php?typ=${schedule.type}&id=${schedule.id}&okres=${currentPeriodId}`}
                        >
                            {schedule.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<{
    schedules: Schedule[];
}> = async (ctx) => {
    const searchParams = paramsSchema.parse(ctx.query);
    const compositeGroupIds = z.array(compositeGroupId).parse(ctx.params?.compositeGroupIds);

    const schedules = await Promise.all(
        compositeGroupIds.map((compositeId) =>
            getSchedule(compositeId.id, compositeId.type, searchParams.period),
        ),
    );

    return {
        props: {
            schedules,
        },
    };
};
