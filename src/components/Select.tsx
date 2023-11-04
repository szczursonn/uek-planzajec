import { type ReactElement } from 'react';

interface SelectProps {
    children?: ReactElement<typeof SelectOption>[];
    value?: string;
    onSelect: (value?: string) => void;
}

const Select = ({ children, value, onSelect }: SelectProps) => {
    return (
        <select
            className={`${
                value === undefined && 'text-zinc-600 dark:text-zinc-400'
            } focus-visible:outline-none rounded-lg bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm block w-full p-2.5 dark:bg-zinc-950 dark:border-zinc-800 dark:placeholder-zinc-400 dark:text-white`}
            value={value}
            onChange={(e) => onSelect(e.currentTarget.value || undefined)}
        >
            {children}
        </select>
    );
};

interface SelectOptionsProps {
    value?: string;
    label?: string;
}

const SelectOption = ({ value, label }: SelectOptionsProps) => {
    return <option value={value} label={label} />;
};

Select.Option = SelectOption;

export default Select;
