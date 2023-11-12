'use client';

import { useDebouncedCurrentDate } from '@/hooks/useDebouncedCurrentDate';
import { getDateWithoutTimezone, getNextSunday, getPreviousMonday, isSameDay } from '@/lib/date';
import { type Schedule } from '@/lib/schema';
import Link from 'next/link';
import { useMemo } from 'react';

interface ScheduleContainerProps {
    schedules: Schedule[];
}

type ExtendedScheduleItem = Schedule['items'][number] & {
    uuid: string;
    startDate: Date;
    endDate: Date;
};

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

export default function ScheduleContainer({ schedules }: ScheduleContainerProps) {
    const days = useMemo(() => {
        const sortedItems = schedules
            .map((schedule) =>
                schedule.items.map((item) => ({
                    ...item,
                    uuid:
                        crypto?.randomUUID?.() ??
                        Math.floor(Math.random() * 1_000_000_000).toString(),
                    startDate: getDateWithoutTimezone(`${item.date} ${item.startTime}`),
                    endDate: getDateWithoutTimezone(`${item.date} ${item.endTime}`),
                })),
            )
            .flat();

        sortedItems.sort((a, b) => (a.startDate.getTime() > b.startDate.getTime() ? 1 : -1));

        const days: {
            day: Date;
            items: ExtendedScheduleItem[];
        }[] = [];

        if (sortedItems.length === 0) {
            return [];
        }

        const firstDay = getPreviousMonday(sortedItems[0]!.startDate);
        const lastDay = getNextSunday(sortedItems.at(-1)!.startDate);

        for (
            const day = new Date(firstDay);
            day.getTime() <= lastDay.getTime();
            day.setDate(day.getDate() + 1)
        ) {
            const itemsInDay: ExtendedScheduleItem[] = [];

            while (sortedItems.length > 0 && isSameDay(sortedItems[0]!.startDate, day)) {
                const item = sortedItems.shift()!;
                itemsInDay.push(item);
            }

            days.push({
                day: new Date(day),
                items: itemsInDay,
            });
        }

        return days;
    }, [schedules]);

    const currentDate = useDebouncedCurrentDate();

    let hasCurrentIndicatorBeenInserted = false;

    return (
        <ul className={`grid grid-cols-1 sm:grid-cols-7 sm:gap-2 sm:gap-y-20`}>
            {days.map(({ day, items }) => {
                return (
                    <li
                        key={day.getTime()}
                        className={`${
                            items.length === 0 ? 'sm:flex hidden' : 'flex'
                        } flex-col my-4 gap-2`}
                    >
                        <span className='flex flex-col items-center border-y-2 sticky top-0 z-30 bg-black truncate'>
                            {new Intl.DateTimeFormat('pl-pl', {
                                day: 'numeric',
                                month: 'long',
                                weekday: 'short',
                            }).format(day)}
                        </span>
                        <ul className='flex flex-col gap-2'>
                            {items.map((item) => {
                                const shouldInsertIndicator =
                                    !hasCurrentIndicatorBeenInserted &&
                                    isSameDay(currentDate, item.startDate) &&
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
                                        <span className='text-xs font-bold'>
                                            {[item.title, item.type].filter(Boolean).join(' - ')}
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
                                                    item.type === 'Przeniesienie zajęć'
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
                                                    className='text-white border border-gray-200 bg-gray-200 bg-opacity-5 hover:bg-opacity-10 font-medium rounded-lg text-sm px-3 py-2 text-center'
                                                >
                                                    Link do zajęć
                                                </Link>
                                            </div>
                                        )}

                                        <span className='text-xs opacity-50 text-right'>
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
    );
}
