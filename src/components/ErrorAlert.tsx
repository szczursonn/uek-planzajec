const ErrorAlert = () => {
    return (
        <div className='flex flex-col items-center gap-2 p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-500 dark:bg-opacity-30 dark:text-red-400'>
            <svg
                fill='none'
                height='24'
                shapeRendering='geometricPrecision'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='1.5'
                viewBox='0 0 24 24'
                width='24'
            >
                <path d='M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z'></path>
                <path d='M12 8v4'></path>
                <path d='M12 16h.01'></path>
            </svg>
            <span className='font-medium'>There was an unexpected error!</span>
            <span>Wait a few minutes and try again.</span>
        </div>
    );
};

export default ErrorAlert;
