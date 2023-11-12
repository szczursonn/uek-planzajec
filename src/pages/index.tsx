import { type InferGetServerSidePropsType, type GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { scheduleTypeSchema, type Schedule } from '@/lib/schema';
import { getSchedule } from '@/lib/scrape';
import DocumentTitle from '@/components/DocumentTitle';
import ScheduleContainer from '@/components/ScheduleContainer';
import { z } from 'zod';

interface SchedulePageProps {
    schedules: Schedule[];
}

export const runtime = 'experimental-edge';

export default function SchedulePage({
    schedules,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter();

    return (
        <div className='sm:mx-[5vw]'>
            <DocumentTitle title={schedules?.map((schedule) => schedule.header.title).join(', ')} />

            <span className='flex gap-2 items-center'>
                <span>{schedules.map((schedule) => schedule.header.title).join(', ')}</span>

                <Link
                    className='dark:hover:text-zinc-300'
                    href={{
                        pathname: '/pick',
                        query: {
                            ...router.query,
                            names: JSON.stringify(
                                schedules.map((schedule) => schedule.header.title),
                            ),
                        },
                    }}
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        height='20'
                        stroke='currentColor'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        viewBox='0 0 24 24'
                        width='20'
                    >
                        <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
                        <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
                    </svg>
                </Link>
            </span>

            <hr className='border-gray-400 dark:border-zinc-700 border-t-2 my-2' />

            <ScheduleContainer schedules={schedules} />

            <hr className='border-gray-400 dark:border-zinc-700 border-t-2 my-2' />

            <h3>{schedules.length === 1 ? 'Oryginalny plan zajęć' : 'Oryginalne plany zajęć'}</h3>
            <ul>
                {schedules.map((schedule) => (
                    <li key={schedule.classicUrl}>
                        <Link
                            href={schedule.classicUrl}
                            className='underline dark:hover:text-zinc-300'
                        >
                            {schedule.header.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const paramsSchema = z.object({
    id: z
        .string()
        .regex(/^\d{1,6}(?:,\d{1,6})*$/)
        .transform((str) => str?.split(',')),
    type: scheduleTypeSchema,
});

export const getServerSideProps: GetServerSideProps<SchedulePageProps> = async (ctx) => {
    const paramsParseResult = paramsSchema.safeParse(ctx.query);

    if (!paramsParseResult.success || paramsParseResult.data.id.length > 3) {
        return {
            props: {
                schedules: [],
            },
            redirect: {
                destination: '/pick?type=G',
            },
        };
    }

    const schedules = (
        await Promise.allSettled(
            paramsParseResult.data.id.map((id) => getSchedule(id, paramsParseResult.data.type)),
        )
    )
        .map((result) => (result.status === 'fulfilled' ? result.value : null))
        .filter((schedule) => schedule !== null) as Schedule[];

    return {
        props: {
            schedules,
        },
    };
};
