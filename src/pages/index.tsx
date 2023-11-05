import { useMemo } from 'react';
import { type InferGetServerSidePropsType, type GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { scheduleTypeSchema, type Schedule } from '@/lib/schema';
import { getSchedule } from '@/lib/scrape';
import { getDateWithoutTimezone } from '@/lib/date';
import DocumentTitle from '@/components/DocumentTitle';
import { useDebouncedCurrentDate } from '@/hooks/useDebouncedCurrentDate';

type ExtendedScheduleItem = Schedule['items'][number] & {
    uuid: string;
    startDate: Date;
    endDate: Date;
};

interface SchedulePageProps {
    schedules: Schedule[];
}

const SCHEDULE_ITEM_STYLE = {
    GRAY: 'bg-gray-800 border-gray-900',
    BLUE: 'bg-sky-800 border-sky-900',
    AMBER: 'bg-amber-800 border-amber-900',
    GREEN: 'bg-green-700 border-green-900',
    INDIGO: 'bg-indigo-700 border-indigo-900',
    GRAY_OUTLINE: 'bg-black border-gray-900 border-[3px]',
};

const SCHEDULE_ITEM_TYPE_TO_CLASS = {
    wykład: SCHEDULE_ITEM_STYLE.BLUE,
    'wykład do wyboru': SCHEDULE_ITEM_STYLE.BLUE,
    'PPUZ wykład': SCHEDULE_ITEM_STYLE.BLUE,
    ćwiczenia: SCHEDULE_ITEM_STYLE.AMBER,
    'ćwiczenia do wyboru': SCHEDULE_ITEM_STYLE.AMBER,
    'ćwiczenia warsztatowe': SCHEDULE_ITEM_STYLE.AMBER,
    'PPUZ ćwicz. warsztatowe': SCHEDULE_ITEM_STYLE.AMBER,
    'PPUZ ćwicz. laboratoryjne': SCHEDULE_ITEM_STYLE.AMBER,
    laboratorium: SCHEDULE_ITEM_STYLE.AMBER,
    'ćwiczenia audytoryjne': SCHEDULE_ITEM_STYLE.AMBER,
    konwersatorium: SCHEDULE_ITEM_STYLE.AMBER,
    'konwersatorium do wyboru': SCHEDULE_ITEM_STYLE.AMBER,
    lektorat: SCHEDULE_ITEM_STYLE.GREEN,
    'PPUZ lektorat': SCHEDULE_ITEM_STYLE.GREEN,
    seminarium: SCHEDULE_ITEM_STYLE.INDIGO,
    'Przeniesienie zajęć': SCHEDULE_ITEM_STYLE.GRAY_OUTLINE,
} as Record<string, string>;

export default function SchedulePage({
    schedules,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const sortedExtendedItems: ExtendedScheduleItem[] = useMemo(() => {
        const items = (schedules ?? [])
            .map((schedule) => schedule.items)
            .flat()
            .map((item) => ({
                ...item,
                uuid: crypto?.randomUUID?.() ?? Math.floor(Math.random() * 1_000_000).toString(),
                startDate: getDateWithoutTimezone(`${item.date} ${item.startTime}`),
                endDate: getDateWithoutTimezone(`${item.date} ${item.endTime}`),
            }));

        items.sort((a, b) => (a.startDate.getTime() > b.startDate.getTime() ? 1 : -1));
        return items;
    }, [schedules]);

    const classesGroupedByDate = useMemo(() => {
        const groups: ExtendedScheduleItem[][] = [];

        for (const item of sortedExtendedItems) {
            const previousDate = groups.at(-1)?.at(-1)?.startDate;
            if (previousDate && item.startDate.getUTCDate() === previousDate.getUTCDate()) {
                groups.at(-1)?.push(item);
            } else {
                groups.at(-1)?.sort();
                groups.push([item]);
            }
        }

        return groups;
    }, [sortedExtendedItems]);

    const router = useRouter();
    const currentDate = useDebouncedCurrentDate();

    let hasCurrentIndicatorBeenInserted = false;

    return (
        <div className='sm:mx-[15vw]'>
            <DocumentTitle title={schedules?.map((schedule) => schedule.header.title).join(', ')} />

            {schedules && (
                <span className='flex gap-2 items-center'>
                    <h2>
                        {schedules?.map((schedule) => (
                            <Link
                                key={schedule.header.title}
                                className='dark:hover:text-zinc-300'
                                href={schedule.classicUrl}
                            >
                                {schedule.header.title}
                            </Link>
                        ))}
                    </h2>

                    <Link
                        href={{
                            pathname: '/pick',
                            query: {
                                ...router.query,
                                names: JSON.stringify(
                                    schedules.map((schedule) => schedule.header.title),
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
                        >
                            <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
                            <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
                        </svg>
                    </Link>
                </span>
            )}

            <hr className='border-gray-400 dark:border-zinc-700 border-t-2 my-2' />

            {classesGroupedByDate.length === 0 && <span>Plan zajęć jest pusty.</span>}

            <ul>
                {classesGroupedByDate.map((group) => {
                    return (
                        <li key={group[0]?.date} className='flex flex-col my-4 gap-2'>
                            <div className='flex flex-col items-center border-y-2 sticky top-0 z-30 bg-black'>
                                {new Intl.DateTimeFormat('pl-pl', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    weekday: 'long',
                                }).format(group[0]?.startDate)}
                            </div>
                            <ul className='flex flex-col gap-2'>
                                {group.map((item) => {
                                    const isCancelled = item.type === 'Przeniesienie zajęć';
                                    const shouldInsertIndicator =
                                        !hasCurrentIndicatorBeenInserted &&
                                        (item.startDate.getTime() > currentDate.getTime() ||
                                            (item.startDate.getTime() < currentDate.getTime() &&
                                                item.endDate.getTime() > currentDate.getTime()));

                                    if (shouldInsertIndicator) {
                                        hasCurrentIndicatorBeenInserted = true;
                                    }

                                    return (
                                        <li
                                            key={item.uuid}
                                            className={`${
                                                SCHEDULE_ITEM_TYPE_TO_CLASS[item.type!] ??
                                                SCHEDULE_ITEM_STYLE.GRAY
                                            } text-white border-2 p-3 rounded-lg relative flex flex-col`}
                                        >
                                            {shouldInsertIndicator && (
                                                <div
                                                    suppressHydrationWarning
                                                    style={{
                                                        top:
                                                            item.startDate.getTime() >
                                                            currentDate.getTime()
                                                                ? '-0.25rem'
                                                                : `${
                                                                      (100 *
                                                                          Math.abs(
                                                                              currentDate.getTime() -
                                                                                  item.startDate.getTime(),
                                                                          )) /
                                                                      Math.abs(
                                                                          item.endDate.getTime() -
                                                                              item.startDate.getTime(),
                                                                      )
                                                                  }%`,
                                                    }}
                                                    className={`absolute left-0 w-full border-t-2 border-red-600 dark:border-zinc-200 before:inline-block before:absolute before:top-[-0.425rem] before:left-[-0.5rem] before:w-3 before:h-3 before:bg-red-600 before:dark:bg-zinc-200 before:rounded-full`}
                                                />
                                            )}
                                            <span className='text-sm'>
                                                {[item.title, item.type]
                                                    .filter(Boolean)
                                                    .join(' - ')}
                                            </span>

                                            <span className='text-xs'>
                                                {item.startTime} - {item.endTime} (
                                                {Math.round(
                                                    (item.endDate.getTime() -
                                                        item.startDate.getTime()) /
                                                        (1_000 * 60 * 45),
                                                )}
                                                h)
                                            </span>

                                            {item.lecturer && (
                                                <span className='text-xs'>{item.lecturer}</span>
                                            )}

                                            {item.location && (
                                                <span className='text-xs flex items-center gap-1'>
                                                    <svg
                                                        xmlns='http://www.w3.org/2000/svg'
                                                        fill='currentColor'
                                                        width='12'
                                                        height='12'
                                                        viewBox='0 0 395.71 395.71'
                                                    >
                                                        <g>
                                                            <path d='M197.849,0C122.131,0,60.531,61.609,60.531,137.329c0,72.887,124.591,243.177,129.896,250.388l4.951,6.738   c0.579,0.792,1.501,1.255,2.471,1.255c0.985,0,1.901-0.463,2.486-1.255l4.948-6.738c5.308-7.211,129.896-177.501,129.896-250.388   C335.179,61.609,273.569,0,197.849,0z M197.849,88.138c27.13,0,49.191,22.062,49.191,49.191c0,27.115-22.062,49.191-49.191,49.191   c-27.114,0-49.191-22.076-49.191-49.191C148.658,110.2,170.734,88.138,197.849,88.138z' />
                                                        </g>
                                                    </svg>
                                                    {item.location.startsWith('http')
                                                        ? 'Online'
                                                        : item.location}
                                                </span>
                                            )}

                                            {item.comment && (
                                                <span
                                                    className={`text-sm border-t-2 dark:border-t-white mt-1 pt-1 ${
                                                        isCancelled
                                                            ? 'dark:text-red-400 border-t-black'
                                                            : 'dark:text-white border-t-white'
                                                    }`}
                                                >
                                                    {item.comment}
                                                </span>
                                            )}

                                            {item.location?.startsWith('http') && (
                                                <div className='mt-4 mb-2'>
                                                    <Link
                                                        href={item.location}
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        className='text-white border border-gray-200 bg-gray-200 bg-opacity-5 hover:bg-opacity-10 font-medium rounded-lg text-sm px-5 py-2.5 text-center'
                                                    >
                                                        Link do zajęć
                                                    </Link>
                                                </div>
                                            )}

                                            <span className='text-xs opacity-60 text-right'>
                                                {item.group}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<SchedulePageProps> = async (ctx) => {
    if (typeof ctx.query.id !== 'string' || ctx.query.id.length === 0) {
        return {
            props: {
                schedules: [],
            },
            redirect: {
                destination: '/pick?type=G',
            },
        };
    }

    const schedules = (
        await Promise.allSettled(
            ctx.query.id
                .split(',')
                .map((id) => getSchedule(id, scheduleTypeSchema.parse(ctx.query.type))),
        )
    )
        .map((result) => (result.status === 'fulfilled' ? result.value : null))
        .filter((schedule) => schedule !== null) as Schedule[];

    return {
        props: {
            schedules,
        },
    };
};
