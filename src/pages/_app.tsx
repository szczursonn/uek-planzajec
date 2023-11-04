import { type AppType } from 'next/app';
import Link from 'next/link';
import Image from 'next/image';
import Router from 'next/router';
import NProgress from 'nprogress';
import { Inter } from 'next/font/google';
import './globals.css';
import DocumentTitle from '@/components/DocumentTitle';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

Router.events.on('routeChangeStart', (_, { shallow }: { shallow: boolean }) => {
    if (!shallow) {
        NProgress.start();
    }
});

Router.events.on('routeChangeComplete', () => {
    NProgress.done(false);
});

const MyApp: AppType = ({ Component, pageProps }) => {
    return (
        <div
            className={`${inter.className} min-h-screen flex flex-col items-center justify-between`}
        >
            <DocumentTitle />
            <Head>
                <meta name='description' content='Plan Zajęć UEK'></meta>
            </Head>
            <header className='z-50 relative mb-2 flex place-items-center'>
                <Link href='/'>
                    <Image
                        className='relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert'
                        src='/uek_logo_red.png'
                        alt='UEK Logo'
                        width={180}
                        height={37}
                        priority
                    />
                </Link>
            </header>

            <main className='w-full px-4 pb-4 mb-auto'>
                <Component {...pageProps} />
            </main>
        </div>
    );
};

export default MyApp;
