import { useMemo } from 'react';
import { type InferGetServerSidePropsType, type GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { z } from 'zod';
import ButtonGroup from '@/components/ButtonGroup';
import DocumentTitle from '@/components/DocumentTitle';
import LinkList from '@/components/LinkList';
import SearchInput from '@/components/SearchInput';
import Select from '@/components/Select';
import { useURLState } from '@/hooks/useURLState';
import { usePickerSchedules } from '@/hooks/usePickerSchedules';
import { useScheduleHeaderDetails } from '@/hooks/useScheduleHeaderDetails';
import { useUniqueObjectValues } from '@/hooks/useUniqueObjectValues';
import { getScheduleSummaries } from '@/lib/scrape';
import { scheduleTypeSchema, type ScheduleHeader } from '@/lib/schema';

interface PickGroupPageProps {
    schedules: ScheduleHeader[];
}

export const runtime = 'experimental-edge';

const SCHEDULE_HEADER_UNIQUE_FIELDS = ['mode', 'year', 'language', 'languageLevel'] as const;

const PickGroupPage = ({ schedules }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const [searchValue, setSearchValue] = useURLState('name');
    const [studyMode, setStudyMode] = useURLState('mode');
    const [studyYear, setStudyYear] = useURLState('year');
    const [studyLanguage, setStudyLanguage] = useURLState('language');
    const [studyLanguageLevel, setStudyLanguageLevel] = useURLState('languageLevel');
    const router = useRouter();

    const parsedSchedules = useScheduleHeaderDetails(schedules);

    const filteredSchedules = useMemo(() => {
        return (
            parsedSchedules?.filter(
                (schedule) =>
                    (!studyMode || schedule.mode === studyMode) &&
                    (!studyYear || schedule.year === studyYear) &&
                    (!studyLanguage || schedule.language === studyLanguage) &&
                    (!studyLanguageLevel || schedule.languageLevel === studyLanguageLevel) &&
                    (!searchValue ||
                        schedule.label.toLowerCase().includes(searchValue.trim().toLowerCase())),
            ) ?? []
        );
    }, [parsedSchedules, searchValue, studyMode, studyYear, studyLanguage, studyLanguageLevel]);

    const uniqueValues = useUniqueObjectValues(parsedSchedules, SCHEDULE_HEADER_UNIQUE_FIELDS);

    const { generateQueryWithSchedule } = usePickerSchedules();

    return (
        <div className='sm:mx-[15vw]'>
            <DocumentTitle title={String(router.query.group)} />
            <span className='flex items-center gap-2'>
                <Link
                    href={{
                        pathname: '/pick',
                        query: {
                            id: router.query.id,
                            names: router.query.names,
                            type: router.query.type,
                        },
                    }}
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 32 32'
                        fill='currentColor'
                        height='20'
                        width='20'
                    >
                        <path d='M32 15H3.41l8.29-8.29-1.41-1.42-10 10a1 1 0 0 0 0 1.41l10 10 1.41-1.41L3.41 17H32z' />
                    </svg>
                </Link>
                <h2>{router.query.group}</h2>
            </span>

            <hr className='border-gray-400 dark:border-zinc-700 border-t-2 my-2' />
            <div className='grid gap-2'>
                <SearchInput
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder={schedules?.[0]?.label}
                />

                {uniqueValues.mode.length > 1 && (
                    <ButtonGroup label='Tryb'>
                        {uniqueValues.mode.map((mode) => (
                            <ButtonGroup.Button
                                key={mode}
                                label={{ S: 'Stacjonarne', N: 'Niestacjonarne' }[mode] ?? mode}
                                value={mode}
                                selected={mode === studyMode}
                                onSelect={(mode) => setStudyMode(studyMode === mode ? '' : mode)}
                            />
                        ))}
                    </ButtonGroup>
                )}

                {uniqueValues.year.length > 1 && (
                    <ButtonGroup label='Rok'>
                        {uniqueValues.year.map((year) => (
                            <ButtonGroup.Button
                                key={year}
                                label={year}
                                value={year}
                                selected={year === studyYear}
                                onSelect={(year) => setStudyYear(studyYear === year ? '' : year)}
                            />
                        ))}
                    </ButtonGroup>
                )}

                <div className='grid grid-cols-2 gap-4 mt-2'>
                    {uniqueValues.language.length > 1 && (
                        <Select
                            value={studyLanguage}
                            onSelect={(language) => setStudyLanguage(language)}
                        >
                            <Select.Option label='Język' />
                            <>
                                {uniqueValues.language.map((language) => (
                                    <Select.Option
                                        key={language}
                                        label={language}
                                        value={language}
                                    />
                                ))}
                            </>
                        </Select>
                    )}

                    {uniqueValues.languageLevel.length > 1 && (
                        <Select
                            value={studyLanguageLevel}
                            onSelect={(languageLevel) => setStudyLanguageLevel(languageLevel)}
                        >
                            <Select.Option label='Poziom języka' />
                            <>
                                {uniqueValues.languageLevel.map((languageLevel) => (
                                    <Select.Option
                                        key={languageLevel}
                                        label={languageLevel}
                                        value={languageLevel}
                                    />
                                ))}
                            </>
                        </Select>
                    )}
                </div>
                <noscript>Enable JavaScript to use search.</noscript>
            </div>

            {schedules !== null && schedules.length === 0 && (
                <div>Nie znaleziono żadnej grupy.</div>
            )}
            {schedules !== null && schedules.length > 0 && filteredSchedules.length === 0 && (
                <div>Żadna grupa nie spełnia wymagań.</div>
            )}

            <div className='mt-2' />
            {filteredSchedules.length > 0 && (
                <LinkList>
                    {filteredSchedules.map((group) => (
                        <LinkList.Item
                            key={group.id}
                            href={{
                                pathname: '/pick',
                                query: {
                                    type: router.query.type,
                                    ...generateQueryWithSchedule({
                                        id: group.id,
                                        name: group.label,
                                    }),
                                },
                            }}
                            label={group.label}
                        />
                    ))}
                </LinkList>
            )}
        </div>
    );
};

export default PickGroupPage;

export const getServerSideProps: GetServerSideProps<PickGroupPageProps> = async (ctx) => {
    const schedules = await getScheduleSummaries(
        z
            .string()
            .min(1)
            .parse(ctx.params?.group),
        scheduleTypeSchema.parse(ctx.query.type),
    );
    return {
        props: {
            schedules,
        },
    };
};
