import { useMemo } from 'react';

export const useUniqueObjectValues = <T extends object, K extends keyof T>(
    records: readonly T[],
    fields: readonly K[],
): Record<K, readonly NonNullable<T[K]>[]> => {
    const uniqueObjectValues = useMemo(() => {
        const fieldToSet = new Map<K, Set<T[K]>>();

        for (const field of fields) {
            fieldToSet.set(field, new Set());
        }

        for (const object of records) {
            for (const field of fields) {
                fieldToSet.get(field)!.add(object[field]);
            }
        }

        const fieldToUniqueList = {} as Record<K, NonNullable<T[K]>[]>;

        for (const field of fields) {
            fieldToUniqueList[field] = Array.from(fieldToSet.get(field)!)
                .filter(Boolean)
                .toSorted() as NonNullable<T[K]>[];
        }

        return fieldToUniqueList;
    }, [records, fields]);

    return uniqueObjectValues;
};
