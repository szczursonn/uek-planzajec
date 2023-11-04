import Link from 'next/link';
import { type ComponentProps, type ReactElement } from 'react';

export interface LinkListProps {
    children?: ReactElement<typeof LinkListItem>[];
}

export default function LinkList({ children }: LinkListProps) {
    return (
        <div>
            <ol className='grid sm:grid-cols-3'>{children}</ol>
        </div>
    );
}

interface LinkListItemProps {
    label?: string;
    href: ComponentProps<typeof Link>['href'];
}

const LinkListItem = ({ label, href }: LinkListItemProps) => {
    return (
        <li>
            <Link
                prefetch={false}
                href={href}
                title={label}
                className='border-b-gray-400 dark:border-b-gray-700 border-b-2 block py-2 sm:py-4 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-900 dark:active:bg-zinc-800'
            >
                {label}
            </Link>
        </li>
    );
};

LinkList.Item = LinkListItem;
