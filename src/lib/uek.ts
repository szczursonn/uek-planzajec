import { z } from 'zod';
import { XMLParser } from 'fast-xml-parser';

const BASE_ENDPOINT = 'https://planzajec.uek.krakow.pl';

const XML_ATTRIBUTES_GROUP_NAME = '__ATTRIBUTES';
const XML_TEXT_NODE_NAME = '__TEXT';

export const scheduleTypeSchema = z.enum(['G', 'N', 'S']);

const undefinedToNull = <T>(value: T) => value ?? null;
const objectToArray = (value: unknown) => {
    if (Array.isArray(value)) {
        return value as unknown[];
    } else if (!value) {
        return [];
    }

    return [value];
};

const categoriesSchema = z
    .object({
        'plan-zajec': z.object({
            grupowanie: z.array(
                z
                    .object({
                        [XML_ATTRIBUTES_GROUP_NAME]: z.object({
                            typ: scheduleTypeSchema,
                            grupa: z.string(),
                        }),
                    })
                    .transform((obj) => ({
                        type: obj[XML_ATTRIBUTES_GROUP_NAME].typ,
                        label: obj[XML_ATTRIBUTES_GROUP_NAME].grupa,
                    })),
            ),
        }),
    })
    .transform((obj) => obj['plan-zajec'].grupowanie);

const groupsSchema = z
    .object({
        'plan-zajec': z.object({
            [XML_ATTRIBUTES_GROUP_NAME]: z.object({
                typ: scheduleTypeSchema,
                grupa: z.string(),
            }),
            zasob: z.array(
                z
                    .object({
                        [XML_ATTRIBUTES_GROUP_NAME]: z.object({
                            typ: scheduleTypeSchema,
                            id: z.string(),
                            nazwa: z.string(),
                        }),
                    })
                    .transform((obj) => ({
                        type: obj[XML_ATTRIBUTES_GROUP_NAME].typ,
                        id: obj[XML_ATTRIBUTES_GROUP_NAME].id,
                        label: obj[XML_ATTRIBUTES_GROUP_NAME].nazwa,
                    })),
            ),
        }),
    })
    .transform((obj) => ({
        type: obj['plan-zajec'][XML_ATTRIBUTES_GROUP_NAME].typ,
        label: obj['plan-zajec'][XML_ATTRIBUTES_GROUP_NAME].grupa,
        groups: obj['plan-zajec'].zasob,
    }));

const scheduleSchema = z
    .object({
        'plan-zajec': z
            .object({
                [XML_ATTRIBUTES_GROUP_NAME]: z
                    .object({
                        typ: scheduleTypeSchema,
                        id: z.string(),
                        idcel: z.string().nullish().transform(undefinedToNull),
                        nazwa: z.string().nullish().transform(undefinedToNull),
                        od: z.string(),
                        do: z.string(),
                    })
                    .transform((obj) => ({
                        id: obj.id,
                        moodleId: obj.idcel,
                        label: obj.nazwa,
                        type: obj.typ,
                    })),
                okres: z.array(
                    z
                        .object({
                            [XML_ATTRIBUTES_GROUP_NAME]: z.object({
                                od: z.string(),
                                do: z.string(),
                                nazwa: z.string(),
                            }),
                        })
                        .transform((obj) => ({
                            from: obj[XML_ATTRIBUTES_GROUP_NAME].od,
                            to: obj[XML_ATTRIBUTES_GROUP_NAME].do,
                            label: obj[XML_ATTRIBUTES_GROUP_NAME].nazwa,
                        })),
                ),
                zajecia: z.preprocess(
                    objectToArray,
                    z
                        .array(
                            z
                                .object({
                                    termin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
                                    dzien: z.string(),
                                    'od-godz': z.string(),
                                    'do-godz': z.string(),
                                    przedmiot: z.string().nullish().transform(undefinedToNull),
                                    typ: z.string(),
                                    nauczyciel: z.preprocess(
                                        objectToArray,
                                        z.array(
                                            z
                                                .string()
                                                .or(
                                                    z.object({
                                                        [XML_TEXT_NODE_NAME]: z.string(),
                                                        [XML_ATTRIBUTES_GROUP_NAME]: z.object({
                                                            moodle: z.string(),
                                                        }),
                                                    }),
                                                )
                                                .nullish()
                                                .transform(undefinedToNull)
                                                .transform((lecturer) => ({
                                                    label:
                                                        lecturer instanceof Object
                                                            ? lecturer[XML_TEXT_NODE_NAME]
                                                            : lecturer,
                                                    moodleId:
                                                        lecturer instanceof Object
                                                            ? lecturer[XML_ATTRIBUTES_GROUP_NAME]
                                                                  .moodle
                                                            : null,
                                                })),
                                        ),
                                    ),
                                    sala: z.string().nullish().transform(undefinedToNull),
                                    grupa: z.string().nullish().transform(undefinedToNull),
                                    uwagi: z.string().nullish().transform(undefinedToNull),
                                })
                                .transform((obj) => ({
                                    date: obj.termin,
                                    start: obj['od-godz'],
                                    end: obj['do-godz'],
                                    subject: obj.przedmiot,
                                    type: obj.typ,
                                    location: obj.sala?.startsWith('<a')
                                        ? z
                                              .object({
                                                  a: z.object({
                                                      [XML_ATTRIBUTES_GROUP_NAME]: z.object({
                                                          href: z.string(),
                                                      }),
                                                  }),
                                              })
                                              .transform(
                                                  (obj) => obj.a[XML_ATTRIBUTES_GROUP_NAME].href,
                                              )
                                              .parse(xmlParser.parse(obj.sala))
                                        : obj.sala,
                                    lecturer: obj.nauczyciel,
                                    group: obj.grupa,
                                    extra: obj.uwagi,
                                })),
                        )
                        .nullish()
                        .transform((items) => items ?? []),
                ),
            })
            .transform((obj) => ({
                ...obj[XML_ATTRIBUTES_GROUP_NAME],
                periods: obj.okres.map((period, i) => ({ ...period, id: String(i + 1) })),
                items: obj.zajecia,
            })),
    })
    .transform((obj) => obj['plan-zajec']);

export type Category = (typeof categoriesSchema._type)[number];
export type CategoryDetail = typeof groupsSchema._type;
export type Schedule = typeof scheduleSchema._type;
type ScheduleType = typeof scheduleTypeSchema._type;

const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributesGroupName: XML_ATTRIBUTES_GROUP_NAME,
    attributeNamePrefix: '',
    textNodeName: XML_TEXT_NODE_NAME,
});

const fetchXML = async (params: Record<string, string> = {}) => {
    const url = new URL(BASE_ENDPOINT);
    for (const key in params) {
        url.searchParams.set(key, params[key]!);
    }
    url.searchParams.set('xml', '');

    return fetch(url)
        .then((res) => res.text())
        .then((xmlString) => xmlParser.parse(xmlString) as unknown);
};

export const getCategories = async (): Promise<Category[]> => {
    return categoriesSchema.parse(await fetchXML());
};

export const getCategoryDetail = async (
    categoryLabel: string,
    type: ScheduleType,
): Promise<CategoryDetail> => {
    return groupsSchema.parse(await fetchXML({ typ: type, grupa: categoryLabel }));
};

export const getSchedule = async (
    id: string,
    type: ScheduleType,
    period: string,
): Promise<Schedule> => {
    const schedule = scheduleSchema.parse(await fetchXML({ typ: type, id, okres: period }));

    if (type === 'G') {
        schedule.items.forEach((item) => {
            item.group = schedule.label;
        });
    } else if (type === 'N') {
        schedule.items.forEach((item) => {
            item.lecturer.push({
                label: schedule.label,
                moodleId: schedule.moodleId,
            });
        });
    } else if (type === 'S') {
        schedule.items.forEach((item) => {
            item.location = schedule.label;
        });
    }

    return schedule;
};
