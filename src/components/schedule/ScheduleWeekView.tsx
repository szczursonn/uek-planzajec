'use client';

import { Fragment, useMemo } from 'react';
import Link from 'next/link';
import { getNextSunday, getPreviousMonday } from '@/lib/date';
import { type ScheduleViewProps } from './ScheduleContainer';

const SCHEDULE_ITEM_STYLE = {
    GRAY: 'bg-gray-600 border-gray-900 dark:bg-gray-800',
    BLUE: 'bg-sky-600 border-sky-900 dark:bg-sky-800',
    AMBER: 'bg-amber-600 border-amber-900 dark:bg-amber-800',
    GREEN: 'bg-green-600 border-green-900 dark:bg-green-700',
    INDIGO: 'bg-indigo-700 border-indigo-900',
    GRAY_OUTLINE: 'bg-inherit text-black dark:text-inherit border-gray-900 border-[3px]',
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
    egzamin: SCHEDULE_ITEM_STYLE.INDIGO,
    'Przeniesienie zajęć': SCHEDULE_ITEM_STYLE.GRAY_OUTLINE,
} as Record<string, string>;

export default function ScheduleWeekView({ sortedItemGroups }: ScheduleViewProps) {
    const sortedItemGroupsWithEmptyDays = useMemo(() => {
        if (sortedItemGroups.length === 0) {
            return [];
        }

        const sortedItemGroupsWithEmptyDays: typeof sortedItemGroups = [];

        const firstDay = getPreviousMonday(sortedItemGroups[0]!.date);
        const dayAfterLastDay = getNextSunday(sortedItemGroups.at(-1)!.date);
        dayAfterLastDay.setDate(dayAfterLastDay.getDate() + 1);

        let i = 0;
        for (
            const day = new Date(firstDay);
            day.getTime() <= dayAfterLastDay.getTime();
            day.setDate(day.getDate() + 1)
        ) {
            const dateStr = `${day.getFullYear()}-${
                day.getMonth() + 1 < 10 ? '0' + (day.getMonth() + 1) : day.getMonth() + 1
            }-${day.getDate() < 10 ? '0' + day.getDate() : day.getDate()}`;

            if (sortedItemGroups[i] && sortedItemGroups[i]!.rawDate === dateStr) {
                sortedItemGroupsWithEmptyDays.push(sortedItemGroups[i]!);
                i++;
            } else {
                sortedItemGroupsWithEmptyDays.push({
                    rawDate: dateStr,
                    date: new Date(dateStr),
                    items: [],
                });
            }
        }

        return sortedItemGroupsWithEmptyDays;
    }, [sortedItemGroups]);

    return (
        <ul className='grid grid-cols-1 sm:grid-cols-7 sm:gap-2 sm:gap-y-20'>
            {sortedItemGroupsWithEmptyDays.map((group) => {
                const formattedDay = new Intl.DateTimeFormat('pl-pl', {
                    day: 'numeric',
                    month: 'long',
                    weekday: 'short',
                }).format(group.date);

                return (
                    <li
                        key={group.rawDate}
                        className={`${
                            group.items.length === 0 ? 'sm:flex hidden' : 'flex'
                        } flex-col my-4 gap-2`}
                    >
                        <span className='flex flex-col items-center border-y-2 sticky top-0 z-30 bg-zinc-300 dark:bg-black border-zinc-400 dark:border-inherit truncate'>
                            {formattedDay}
                        </span>
                        <ul className='flex flex-col gap-2'>
                            {group.items.map((item) => {
                                return (
                                    <li
                                        key={item.uuid}
                                        className={`${
                                            SCHEDULE_ITEM_TYPE_TO_CLASS[item.type] ??
                                            SCHEDULE_ITEM_STYLE.GRAY
                                        } text-white border-2 p-3 rounded-lg relative flex flex-col`}
                                    >
                                        <span className='text-xs font-bold'>
                                            {[item.subject, item.type].filter(Boolean).join(' - ')}
                                        </span>

                                        <span className='text-xs'>
                                            {`${item.start} - ${item.end}`}
                                        </span>

                                        {item.lecturer.length > 0 && (
                                            <span className='text-xs flex gap-2'>
                                                {item.lecturer.map((lecturer) => (
                                                    <Fragment key={lecturer.label}>
                                                        {lecturer.moodleId ? (
                                                            <Link
                                                                href={`https://e-uczelnia.uek.krakow.pl/course/view.php?id=${lecturer.moodleId.substring(
                                                                    1,
                                                                )}`}
                                                                target='_blank'
                                                            >
                                                                {lecturer.label}
                                                            </Link>
                                                        ) : (
                                                            <span>{lecturer.label}</span>
                                                        )}
                                                    </Fragment>
                                                ))}
                                            </span>
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

                                        {item.extra && (
                                            <span
                                                className={`text-sm border-t-2 dark:border-t-white mt-1 pt-1 ${
                                                    item.type === 'Przeniesienie zajęć'
                                                        ? 'dark:text-red-400 border-t-black'
                                                        : 'dark:text-white border-t-white'
                                                }`}
                                            >
                                                {item.extra}
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
