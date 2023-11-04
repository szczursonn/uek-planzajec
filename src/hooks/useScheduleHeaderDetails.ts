import { type ScheduleHeader } from '@/lib/schema';
import { useMemo } from 'react';

const NORMAL_GROUP_REGEX = /^[A-Z]{4}(?<mode>.)(?<stage>.)-(?<year>.)/;
const CJ_GROUP_REGEX =
    /CJ-{1,2}(?<mode>[SN])(?<stage>.)-(?<year>.)\/\d-?(?<language>[A-Z]{3})\.(?<languageLevel>[A-Za-z0-9]{2})/;
const PPUZ_GROUP_REGEX = /PPUZ-[A-Z]{3}(?<mode>[A-Z])(?<stage>.)-(?<year>.)\d+/;

const getYear = (stage: string | undefined, labelYear: string | undefined) => {
    const labelYearAsNumber = parseInt(labelYear ?? '');

    if (!isFinite(labelYearAsNumber)) {
        return null;
    } else if (stage === '1' || stage === 'M') {
        return labelYearAsNumber;
    } else if (stage === '2') {
        return labelYearAsNumber + 3;
    }

    return null;
};

export const useScheduleHeaderDetails = (scheduleHeaders: ScheduleHeader[]) => {
    return useMemo(
        () =>
            scheduleHeaders.map((header) => {
                const details =
                    header.label.match(NORMAL_GROUP_REGEX)?.groups ??
                    header.label.match(CJ_GROUP_REGEX)?.groups ??
                    header.label.match(PPUZ_GROUP_REGEX)?.groups;

                return {
                    ...header,
                    mode: details?.mode,
                    year: getYear(details?.stage, details?.year)
                        ?.toString()
                        .trim(),
                    language: details?.language?.trim(),
                    languageLevel: details?.languageLevel?.trim(),
                };
            }),
        [scheduleHeaders],
    );
};
