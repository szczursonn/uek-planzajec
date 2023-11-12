export const getDateWithoutTimezone = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - userTimezoneOffset);
};

export const getSchoolHoursBetweenDates = (date1: Date, date2: Date) => {
    return Math.abs(date1.getTime() - date2.getTime()) / (45 * 60 * 1000);
};

export const isSameDay = (date1: Date, date2: Date) => {
    return (
        date1.getUTCFullYear() === date2.getUTCFullYear() &&
        date1.getUTCMonth() === date2.getUTCMonth() &&
        date1.getUTCDate() === date2.getUTCDate()
    );
};

export const getPreviousMonday = (date: Date) => {
    const diff = date.getUTCDate() - date.getUTCDay() + (date.getUTCDay() === 0 ? -6 : 1);
    return new Date(new Date(date).setUTCDate(diff));
};

export const getNextSunday = (date: Date) => {
    if (date.getUTCDay() === 0) {
        return new Date(date);
    }

    const diff = 6 - date.getUTCDay() + (date.getUTCDay() === 0 ? 0 : 1);
    return new Date(new Date(date).setUTCDate(date.getUTCDate() + diff));
};
