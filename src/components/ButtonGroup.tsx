import { type ReactElement } from 'react';

interface ButtonGroupProps {
    children?: ReactElement<typeof ButtonGroupButton>[];
    label?: string;
}

const ButtonGroup = ({ children, label }: ButtonGroupProps) => {
    return (
        <div>
            {label !== undefined && <span className='text-sm'>{label}</span>}
            <div className='flex rounded-md shadow-sm w-full' role='group'>
                {children}
            </div>
        </div>
    );
};

interface ButtonGroupButton<T> {
    label?: string;
    value: T;
    selected?: boolean;
    onSelect?: (selectedValue: T) => void;
}

const ButtonGroupButton = <T,>({
    label,
    value,
    selected,
    onSelect = () => void 0,
}: ButtonGroupButton<T>) => {
    return (
        <button
            type='button'
            className={`${
                selected
                    ? 'bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                    : 'bg-white hover:bg-gray-100 dark:bg-zinc-950 dark:hover:bg-zinc-900'
            } dark:hover:not first:rounded-l-lg last:rounded-r-lg w-full py-2 text-sm font-medium text-gray-900 dark:text-white dark:hover:text-white border border-gray-200 dark:border-zinc-800`}
            onClick={() => onSelect(value)}
        >
            {label}
        </button>
    );
};

ButtonGroup.Button = ButtonGroupButton;

export default ButtonGroup;
