export const getDateWithoutTimezone = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - userTimezoneOffset);
};

export const getSchoolHoursBetweenDates = (date1: Date, date2: Date) => {
    return Math.abs(date1.getTime() - date2.getTime()) / (45 * 60 * 1000);
};
