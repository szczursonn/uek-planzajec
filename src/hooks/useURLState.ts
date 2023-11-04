import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const useURLState = (key: string) => {
    const router = useRouter();

    const currentValue = (
        Array.isArray(router.query[key]) ? String(router.query[key]) : router.query[key]
    ) as string | undefined;

    const [optimisticValue, setOptimisticValue] = useState(currentValue);

    const setValue = (newValue?: string) => {
        const newQuery = { ...router.query };

        if (newValue === undefined || newValue === '') {
            delete newQuery[key];
        } else {
            newQuery[key] = newValue;
        }

        setOptimisticValue(newValue);
        void router.replace({ query: newQuery }, undefined, { shallow: true });
    };

    useEffect(() => {
        const currentValue = (
            Array.isArray(router.query[key]) ? String(router.query[key]) : router.query[key]
        ) as string | undefined;
        if (currentValue !== optimisticValue) {
            setOptimisticValue(currentValue);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query[key]]);

    return [optimisticValue, setValue] as const;
};
