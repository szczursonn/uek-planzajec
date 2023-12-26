import { useMemo } from 'react';
import { type InferGetServerSidePropsType, type GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ButtonGroup from '@/components/ButtonGroup';
import DocumentTitle from '@/components/DocumentTitle';
import LinkList from '@/components/LinkList';
import SearchInput from '@/components/SearchInput';
import Select from '@/components/Select';
import { useURLState } from '@/hooks/useURLState';
import { useUniqueObjectValues } from '@/hooks/useUniqueObjectValues';
import { type CategoryDetail, getCategoryDetail, scheduleTypeSchema } from '@/lib/uek';
import { usePickerState } from '@/hooks/usePickerState';

export const runtime = 'experimental-edge';

const SCHEDULE_HEADER_UNIQUE_FIELDS = ['mode', 'year', 'language', 'languageLevel'] as const;

const NORMAL_GROUP_REGEX = /^[A-Z]{4}(?<mode>.)(?<stage>.)-(?<year>.)/;
const CJ_GROUP_REGEX =
    /CJ-{1,2}(?<mode>[SN])(?<stage>.)-(?<year>.)\/\d-?(?<language>[A-Z]{3})\.(?<languageLevel>[A-Za-z0-9]{2})/;
const PPUZ_GROUP_REGEX = /PPUZ-[A-Z]{3}(?<mode>[A-Z])(?<stage>.)-(?<year>.)\d+/;

const getGroupYear = (stage: string | undefined, labelYear: string | undefined) => {
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

export default function PickGroupPage({
    category,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [searchValue, setSearchValue] = useURLState('name');
    const [studyMode, setStudyMode] = useURLState('mode');
    const [studyYear, setStudyYear] = useURLState('year');
    const [studyLanguage, setStudyLanguage] = useURLState('language');
    const [studyLanguageLevel, setStudyLanguageLevel] = useURLState('languageLevel');
    const router = useRouter();

    const selectedSchedules = usePickerState();

    const detailedGroups = useMemo(
        () =>
            category.groups.map((group) => {
                const details =
                    group.label.match(NORMAL_GROUP_REGEX)?.groups ??
                    group.label.match(CJ_GROUP_REGEX)?.groups ??
                    group.label.match(PPUZ_GROUP_REGEX)?.groups;

                return {
                    ...group,
                    mode: details?.mode,
                    year: getGroupYear(details?.stage, details?.year)
                        ?.toString()
                        .trim(),
                    language: details?.language?.trim(),
                    languageLevel: details?.languageLevel?.trim(),
                };
            }),
        [category.groups],
    );

    const filteredGroups = useMemo(() => {
        return (
            detailedGroups.filter(
                (group) =>
                    (!studyMode || group.mode === studyMode) &&
                    (!studyYear || group.year === studyYear) &&
                    (!studyLanguage || group.language === studyLanguage) &&
                    (!studyLanguageLevel || group.languageLevel === studyLanguageLevel) &&
                    (!searchValue ||
                        group.label.toLowerCase().includes(searchValue.trim().toLowerCase())),
            ) ?? []
        );
    }, [detailedGroups, searchValue, studyMode, studyYear, studyLanguage, studyLanguageLevel]);

    const uniqueValues = useUniqueObjectValues(detailedGroups, SCHEDULE_HEADER_UNIQUE_FIELDS);

    return (
        <div className='sm:mx-[15vw]'>
            <DocumentTitle title={String(router.query.group)} />
            <span className='flex items-center gap-2'>
                <Link
                    href={{
                        pathname: '/pick',
                        query: {
                            state: router.query.state,
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
                    placeholder={detailedGroups[0]?.label}
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

            {detailedGroups !== null && detailedGroups.length === 0 && (
                <div>Nie znaleziono żadnej grupy.</div>
            )}
            {detailedGroups !== null &&
                detailedGroups.length > 0 &&
                filteredGroups.length === 0 && <div>Żadna grupa nie spełnia wymagań.</div>}

            <div className='mt-2' />
            {filteredGroups.length > 0 && (
                <LinkList>
                    {filteredGroups.map((group) => (
                        <LinkList.Item
                            key={group.id}
                            href={{
                                pathname: '/pick',
                                query: {
                                    type: group.type,
                                    state: JSON.stringify([
                                        ...selectedSchedules,
                                        {
                                            type: group.type,
                                            id: group.id,
                                            label: group.label,
                                        },
                                    ]),
                                },
                            }}
                            label={group.label}
                        />
                    ))}
                </LinkList>
            )}
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<{
    category: CategoryDetail;
}> = async (ctx) => {
    return {
        props: {
            category: await getCategoryDetail(
                String(ctx.params?.group),
                scheduleTypeSchema.parse(ctx.params?.type),
            ),
        },
    };
};
