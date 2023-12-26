import { useMemo } from 'react';
import { type InferGetServerSidePropsType, type GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useURLState } from '@/hooks/useURLState';
import LinkList from '@/components/LinkList';
import SearchInput from '@/components/SearchInput';
import DocumentTitle from '@/components/DocumentTitle';
import { type Category, getCategories } from '@/lib/uek';
import { usePickerState } from '@/hooks/usePickerState';

const SCHEDULE_TYPE_TO_LABEL: Record<string, string> = {
    S: 'Sale',
    N: 'Nauczyciele',
    G: 'Grupy',
};

export const runtime = 'experimental-edge';

export default function PickerPage({
    categories,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter();
    let [type] = useURLState('type');
    const [searchValue, setSearchValue] = useURLState('name');

    if (!type) {
        type = 'G';
    }

    const selectedSchedules = usePickerState();

    const currentCategories = useMemo(() => {
        return categories.filter(
            (category) =>
                category.type === type &&
                (!searchValue ||
                    category.label.toLowerCase().includes(searchValue.trim().toLowerCase())),
        );
    }, [categories, type, searchValue]);

    return (
        <div className='sm:mx-[15vw]'>
            <DocumentTitle title='Wybierz grupę' />
            {selectedSchedules.length > 0 ? (
                <div className='mt-2 mb-4'>
                    <Link
                        className='text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none'
                        href={{
                            pathname: `/schedule/${selectedSchedules
                                .map(
                                    (selectedSchedule) =>
                                        `${selectedSchedule.type}${selectedSchedule.id}`,
                                )
                                .join('/')}`,
                        }}
                    >
                        Plan zajęć
                    </Link>
                </div>
            ) : (
                <span>Wybierz co najmniej jedną grupę aby zobaczyć plan zajęć</span>
            )}

            <ul className='flex flex-wrap -mb-px'>
                {['G', 'N', 'S'].map((categoryType) => (
                    <li key={categoryType}>
                        <Link
                            href={{
                                pathname: router.pathname,
                                query: {
                                    state: router.query.state,
                                    type: categoryType,
                                },
                            }}
                            shallow
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${
                                categoryType === type
                                    ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                    : 'text-zinc-400 border-zinc-600 hover:text-zinc-600 hover:border-zinc-300 dark:hover:text-zinc-300'
                            }`}
                        >
                            {SCHEDULE_TYPE_TO_LABEL[categoryType] ?? categoryType}
                        </Link>
                    </li>
                ))}
            </ul>

            <div className='mt-2'>
                {selectedSchedules.map((schedule) => {
                    const stateWithoutThisSchedule = selectedSchedules.filter(
                        (sch) => sch.id !== schedule.id,
                    );

                    return (
                        <span
                            key={schedule.type + schedule.id}
                            className='inline-flex items-center px-2 mb-2 py-1 mr-2 text-sm font-medium text-zinc-800 bg-zinc-100 rounded dark:bg-zinc-700 dark:text-zinc-300'
                        >
                            {schedule.label}
                            <Link
                                href={{
                                    pathname: router.pathname,
                                    query: {
                                        ...router.query,
                                        state: JSON.stringify(stateWithoutThisSchedule),
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
                    <form action='' method='GET'>
                        <input type='hidden' readOnly name='state' value={router.query.state} />
                        <input type='hidden' readOnly name='type' value={router.query.type} />
                        <SearchInput
                            name='name'
                            value={searchValue}
                            onChange={setSearchValue}
                            placeholder='Informatyka Stosowana'
                        />
                        <noscript>
                            <button
                                type='submit'
                                className='focus-visible:outline-none rounded-lg mt-2 bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm block w-16 p-2.5 dark:bg-zinc-950 dark:border-zinc-800 dark:placeholder-zinc-400 dark:text-white'
                            >
                                OK
                            </button>
                        </noscript>
                    </form>

                    <div className='mt-2' />

                    {currentCategories.length > 0 && (
                        <LinkList>
                            {currentCategories.map((category) => (
                                <LinkList.Item
                                    key={category.label}
                                    label={category.label}
                                    href={{
                                        pathname: `/pick/${category.type}/${category.label}`,
                                        query: {
                                            state: router.query.state,
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
}

export const getServerSideProps: GetServerSideProps<{
    categories: Category[];
}> = async () => {
    return {
        props: {
            categories: await getCategories(),
        },
    };
};
