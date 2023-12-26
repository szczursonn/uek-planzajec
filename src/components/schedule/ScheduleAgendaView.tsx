import Link from 'next/link';
import { type ScheduleViewProps } from './ScheduleContainer';
import { Fragment } from 'react';

const SCHEDULE_ITEM_TYPE_TO_CIRCLE_COLOR_CLASS = {
    wykład: 'bg-sky-600',
    'wykład do wyboru': 'bg-sky-600',
    'PPUZ wykład': 'bg-sky-600',
    ćwiczenia: 'bg-amber-600',
    'ćwiczenia do wyboru': 'bg-amber-600',
    'ćwiczenia warsztatowe': 'bg-amber-600',
    'PPUZ ćwicz. warsztatowe': 'bg-amber-600',
    'PPUZ ćwicz. laboratoryjne': 'bg-amber-600',
    laboratorium: 'bg-amber-600',
    'ćwiczenia audytoryjne': 'bg-amber-600',
    konwersatorium: 'bg-amber-600',
    'konwersatorium do wyboru': 'bg-amber-600',
    lektorat: 'bg-green-600',
    'PPUZ lektorat': 'bg-green-600',
    seminarium: 'bg-indigo-700',
    egzamin: 'bg-red-500',
} as Readonly<Record<string, string>>;

export default function ScheduleAgendaView({ sortedItemGroups }: ScheduleViewProps) {
    return (
        <ul className='divide-y-2 divide-zinc-700'>
            {sortedItemGroups.map((group) => (
                <li key={group.rawDate} className='grid grid-cols-12 gap-2 py-2'>
                    <span className='sm:col-span-1 col-span-3 grid grid-cols-3 h-min items-end gap-2 sm:px-5 truncate'>
                        <span className='sm:col-span-1 col-span-3 text-2xl sm:text-end text-center'>
                            {group.date.getDate()}
                        </span>
                        <span className='sm:col-span-2 col-span-3 sm:text-left text-center text-zinc-400'>
                            {new Intl.DateTimeFormat('pl-pl', {
                                month: 'short',
                                weekday: 'short',
                            }).format(group.date)}
                        </span>
                    </span>
                    <ul className='sm:col-span-11 col-span-9 flex flex-col gap-2'>
                        {group.items.map((item) => {
                            const isCancelled = item.type === 'Przeniesienie zajęć';

                            return (
                                <li
                                    key={item.uuid}
                                    className={`grid grid-cols-12 ${
                                        isCancelled
                                            ? 'dark:text-zinc-400'
                                            : 'text-black dark:text-zinc-200'
                                    } py-2`}
                                >
                                    <span className='sm:col-span-2 col-span-12 flex flex-row gap-4'>
                                        <span
                                            className={`${
                                                SCHEDULE_ITEM_TYPE_TO_CIRCLE_COLOR_CLASS[
                                                    item.type
                                                ] ?? 'bg-black border-2 border-zinc-300'
                                            } rounded-full h-5 w-5`}
                                            aria-hidden
                                        />
                                        <span
                                            className={`text-sm ${isCancelled && 'line-through'}`}
                                        >
                                            {`${item.start} - ${item.end}`}
                                        </span>
                                    </span>
                                    <div className='sm:col-span-10 col-span-12'>
                                        <span className='flex gap-2 items-baseline sm:justify-normal justify-between'>
                                            <span
                                                className={`text-sm font-bold${
                                                    isCancelled ? ' line-through' : ''
                                                }`}
                                            >
                                                {[item.subject, item.type]
                                                    .filter(Boolean)
                                                    .join(' - ')}
                                            </span>
                                            <span className='text-xs opacity-50 text-right'>
                                                {item.group}
                                            </span>
                                        </span>
                                        <span className='flex gap-2'>
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
                                        </span>
                                        {item.extra && (
                                            <span className='text-sm dark:text-red-400'>
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
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </li>
            ))}
        </ul>
    );
}
