'use client';

import { useMemo } from 'react';
import { type Schedule } from '@/lib/uek';
import ScheduleAgendaView from './ScheduleAgendaView';
import ScheduleWeekView from './ScheduleWeekView';

interface ScheduleItemGroup {
    rawDate: string;
    date: Date;
    items: (Schedule['items'][number] & { uuid: string })[];
}

export interface ScheduleViewProps {
    sortedItemGroups: ScheduleItemGroup[];
}

export default function ScheduleContainer({
    schedules,
    view,
}: {
    schedules: Schedule[];
    view: string;
}) {
    const sortedItemGroups: ScheduleItemGroup[] = useMemo(
        () =>
            Object.entries(
                schedules
                    .map((schedule) => schedule.items)
                    .flat()
                    .reduce(
                        (itemsByDate, item) => {
                            if (itemsByDate[item.date]) {
                                itemsByDate[item.date]!.push(item);
                            } else {
                                itemsByDate[item.date] = [item];
                            }

                            return itemsByDate;
                        },
                        {} as Record<string, (typeof schedules)[number]['items']>,
                    ),
            )
                .map(([date, items]) => ({
                    rawDate: date,
                    date: new Date(date),
                    items: items
                        .sort((a, b) => (a.start < b.start ? -1 : 1))

                        .map((item) => ({
                            ...item,
                            uuid:
                                crypto?.randomUUID?.() ||
                                Math.floor(Math.random() * 1_000_000_000).toString(30),
                        })),
                }))
                .sort((a, b) => (a.rawDate < b.rawDate ? -1 : 1)),
        [schedules],
    );

    const ViewComponent =
        {
            agenda: ScheduleAgendaView,
            week: ScheduleWeekView,
        }[view] ?? ScheduleAgendaView;

    return <ViewComponent sortedItemGroups={sortedItemGroups} />;
}
