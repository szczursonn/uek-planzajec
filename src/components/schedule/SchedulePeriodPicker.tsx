'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type Schedule } from '@/lib/uek';
import Select from '@/components/Select';

export default function SchedulePeriodPicker({
    periods,
    currentPeriodId,
}: {
    periods: Schedule['periods'];
    currentPeriodId: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        setDisabled(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams.toString()]);

    return (
        <form action='' method='GET'>
            {Array.from(searchParams.entries())
                .filter(([key]) => key !== 'period')
                .map(([key, value]) => (
                    <input key={key} hidden readOnly type='text' name={key} value={value} />
                ))}
            <Select
                name='period'
                disabled={disabled}
                value={currentPeriodId}
                onSelect={(newPeriodId) => {
                    if (newPeriodId && newPeriodId !== currentPeriodId) {
                        setDisabled(true);

                        const newSearchParams = new URLSearchParams(searchParams);
                        newSearchParams.set('period', newPeriodId);
                        router.replace(`${pathname}?${newSearchParams.toString()}`);
                    }
                }}
            >
                {periods.map((period) => (
                    <Select.Option key={period.id} value={period.id} label={period.label} />
                ))}
            </Select>
            <noscript>
                <button
                    type='submit'
                    className='focus-visible:outline-none rounded-lg mt-2 bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm block w-16 p-2.5 dark:bg-zinc-950 dark:border-zinc-800 dark:placeholder-zinc-400 dark:text-white'
                >
                    OK
                </button>
            </noscript>
        </form>
    );
}
