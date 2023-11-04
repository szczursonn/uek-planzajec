import { env } from '@/env.mjs';
import { parse } from 'node-html-parser';
import {
    type Schedule,
    scheduleSchema,
    scheduleGroupSchema,
    type ScheduleType,
    type ScheduleHeader,
    scheduleHeaderSchema,
} from './schema';
import { z } from 'zod';

const fetchDocument = async (url: string) => {
    return fetch(url)
        .then((res) => res.text())
        .then((html) => parse(html));
};

const getEndpoint = (params: Record<string, string> = {}) => {
    const url = new URL(env.BASE_URL);
    for (const key in params) {
        url.searchParams.set(key, params[key]!);
    }
    return url.toString();
};

export const getScheduleGroups = async () => {
    const document = await fetchDocument(getEndpoint());

    const groups = document.querySelectorAll('.kategorie');

    return z.array(scheduleGroupSchema).parse([
        {
            type: 'G',
            items: groups[1]?.querySelectorAll('a').map((el) => el.textContent) ?? [],
        },
        {
            type: 'N',
            items: groups[0]?.querySelectorAll('a').map((el) => el.textContent) ?? [],
        },
        {
            type: 'S',
            items: groups[2]?.querySelectorAll('a').map((el) => el.textContent) ?? [],
        },
    ]);
};

export const getScheduleSummaries = async (
    groupName: string,
    type: ScheduleType,
): Promise<ScheduleHeader[]> => {
    const document = await fetchDocument(getEndpoint({ typ: type, grupa: groupName }));

    return z.array(scheduleHeaderSchema).parse(
        document.querySelectorAll('.kolumna a').map((linkEl) => {
            const id = new URLSearchParams(linkEl.getAttribute('href')).get('id');
            const label = linkEl.textContent.trim();

            return {
                id,
                label,
                type,
            };
        }),
    );
};

const CLASS_HOUR_REGEX = /(?<start>\d{2}:\d{2}) - (?<end>\d{2}:\d{2})/;

export const getSchedule = async (id: string, type: ScheduleType): Promise<Schedule> => {
    const classicUrl = getEndpoint({ typ: type, id, okres: '1' });
    const document = await fetchDocument(classicUrl);

    const header = {
        title: document.querySelector('div.grupa')?.textContent,
        moodleUrl: document.querySelector('div.grupa a')?.getAttribute('href'),
    };

    const items: Record<string, unknown>[] = [];

    for (const rowEl of document.querySelectorAll('table > tr:not(:has(th))')) {
        const cells = rowEl.querySelectorAll('td');

        if (cells.length === 1) {
            if (items.length > 0) {
                items[items.length - 1]!.comment = cells[0]!.textContent;
            }
            continue;
        }

        const { start, end } = cells[1]?.textContent.match(CLASS_HOUR_REGEX)?.groups ?? {};

        const itemType = cells[3]?.textContent;

        // skip language slots
        if (itemType === 'lektorat' && !header.title?.startsWith('CJ')) {
            continue;
        }

        items.push({
            date: cells[0]?.textContent,
            startTime: start,
            endTime: end,
            title: cells[2]?.textContent?.trim(),
            type: itemType,
            lecturer: type === 'N' ? header.title : cells[4]?.textContent?.trim(),
            lecturerUrl:
                type === 'N'
                    ? header.moodleUrl
                    : cells[4]?.querySelector('a')?.getAttribute('href'),
            location:
                type === 'S'
                    ? header.title
                    : type === 'G'
                    ? cells[5]?.querySelector('a')?.getAttribute('href') ??
                      cells[5]?.textContent?.trim()
                    : cells[4]?.querySelector('a')?.getAttribute('href') ??
                      cells[4]?.textContent?.trim(),
            group:
                type === 'G'
                    ? header.title
                    : cells[5]?.querySelector('a')?.getAttribute('href') ??
                      cells[5]?.textContent?.trim(),
        });
    }

    return scheduleSchema.parse({
        type,
        classicUrl,
        header,
        items,
    });
};
