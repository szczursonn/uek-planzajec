export default function SearchInput({
    value,
    onChange = () => void 0,
    placeholder,
}: {
    value?: string;
    onChange?: (newValue: string) => void;
    placeholder?: string;
}) {
    return (
        <div className='relative'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                <svg
                    className='w-4 h-4 text-gray-500 dark:text-gray-400'
                    aria-hidden='true'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 20 20'
                >
                    <path
                        stroke='currentColor'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'
                    />
                </svg>
            </div>
            <input
                type='search'
                className='block w-full p-2 pl-10 text-sm text-gray-900 border focus-visible:outline-none border-gray-300 rounded-lg bg-gray-50 dark:bg-zinc-950 dark:border-zinc-800 dark:placeholder-zinc-400 dark:text-white'
                placeholder={placeholder}
                value={value ?? ''}
                onChange={(e) => onChange(e.currentTarget.value)}
            />
        </div>
    );
}
