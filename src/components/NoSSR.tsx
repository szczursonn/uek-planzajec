import { type ReactNode } from 'react';
import dynamic from 'next/dynamic';

const _NoSsr = ({ children }: { children?: ReactNode }) => {
    return <>{children}</>;
};

export const NoSSR = dynamic(() => Promise.resolve(_NoSsr), { ssr: false });
