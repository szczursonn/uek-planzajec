import { useMemo } from 'react';
import { type InferGetServerSidePropsType, type GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { type ScheduleGroup } from '@/lib/schema';
import { getScheduleGroups } from '@/lib/scrape';
import { useURLState } from '@/hooks/useURLState';
import { usePickerSchedules } from '@/hooks/usePickerSchedules';
import LinkList from '@/components/LinkList';
import SearchInput from '@/components/SearchInput';
import DocumentTitle from '@/components/DocumentTitle';

const SCHEDULE_TYPE_TO_LABEL = {
    S: 'Sale',
    N: 'Nauczyciele',
    G: 'Grupy',
};

interface PickerPageProps {
    groups: ScheduleGroup[];
}

export const runtime = 'experimental-edge';

const PickerPage = ({ groups }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const router = useRouter();
    const [searchValue, setSearchValue] = useURLState('name');
    const [type] = useURLState('type');

    const filteredOptions = useMemo(() => {
        return (
            groups
                ?.find((category) => category.type === type)
                ?.items?.filter(
                    (option) =>
                        !searchValue ||
                        option.toLowerCase().includes(searchValue.trim().toLowerCase()),
                ) ?? []
        );
    }, [groups, type, searchValue]);

    const { selectedSchedules, generateQueryWithoutSchedule } = usePickerSchedules();

    return (
        <div className='sm:mx-[15vw]'>
            <DocumentTitle title='Wybierz grupę' />
            {selectedSchedules.length > 0 && (
                <div className='mt-2 mb-4'>
                    <Link
                        className='text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none'
                        href={{
                            pathname: '/',
                            query: {
                                id: selectedSchedules.map((group) => group.id).join(','),
                                type,
                            },
                        }}
                    >
                        Plan zajęć
                    </Link>
                </div>
            )}

            {selectedSchedules.length === 0 && (
                <span>Wybierz co najmniej jedną grupę aby zobaczyć plan zajęć</span>
            )}

            <ul className='flex flex-wrap -mb-px'>
                {groups?.map((group) => (
                    <li key={group.type}>
                        <Link
                            href={{
                                pathname: router.pathname,
                                query: {
                                    type: group.type,
                                },
                            }}
                            shallow
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${
                                group.type === type
                                    ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                    : 'text-zinc-400 border-zinc-600 hover:text-zinc-600 hover:border-zinc-300 dark:hover:text-zinc-300'
                            }`}
                        >
                            {SCHEDULE_TYPE_TO_LABEL[group.type] ?? group.type}
                        </Link>
                    </li>
                ))}
            </ul>

            <div className='mt-2'>
                {selectedSchedules.map((group) => {
                    return (
                        <span
                            key={group.id}
                            className='inline-flex items-center px-2 mb-2 py-1 mr-2 text-sm font-medium text-zinc-800 bg-zinc-100 rounded dark:bg-zinc-700 dark:text-zinc-300'
                        >
                            {group.name}
                            <Link
                                href={{
                                    pathname: router.pathname,
                                    query: {
                                        ...router.query,
                                        ...generateQueryWithoutSchedule(group),
                                    },
                                }}
                                shallow
                                className='inline-flex items-center p-1 ml-2 text-sm text-zinc-400 bg-transparent rounded-sm hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-600 dark:hover:text-zinc-300'
                                aria-label='Remove'
                            >
                                <svg
                                    className='w-2 h-2'
                                    aria-hidden='true'
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 14 14'
                                >
                                    <path
                                        stroke='currentColor'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth='2'
                                        d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
                                    />
                                </svg>
                                <span className='sr-only'>Usuń grupę</span>
                            </Link>
                        </span>
                    );
                })}
            </div>

            {selectedSchedules.length < 3 ? (
                <>
                    <SearchInput
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder='Informatyka Stosowana'
                    />
                    <noscript>Enable JavaScript to use search.</noscript>

                    <div className='mt-2' />

                    {filteredOptions.length > 0 && (
                        <LinkList>
                            {filteredOptions.map((option) => (
                                <LinkList.Item
                                    key={option}
                                    label={option}
                                    href={{
                                        pathname: `/pick/${option}`,
                                        query: {
                                            id: router.query.id,
                                            names: router.query.names,
                                            type: router.query.type,
                                        },
                                    }}
                                />
                            ))}
                        </LinkList>
                    )}
                </>
            ) : (
                <span>Możesz wybrać do 3 grup jednocześnie.</span>
            )}
        </div>
    );
};

export default PickerPage;

export const getServerSideProps: GetServerSideProps<PickerPageProps> = async () => {
    return {
        props: {
            groups: await getScheduleGroups(),
        },
    };
};
