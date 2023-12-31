import { type AppType } from 'next/app';
import Link from 'next/link';
import Image from 'next/image';
import Router from 'next/router';
import NProgress from 'nprogress';
import { Inter } from 'next/font/google';
import './globals.css';
import DocumentTitle from '@/components/DocumentTitle';
import Head from 'next/head';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

const MyApp: AppType = ({ Component, pageProps }) => {
    useEffect(() => {
        const handleRouteChangeStart = (_: unknown, { shallow }: { shallow: boolean }) => {
            if (!shallow) {
                NProgress.start();
            }
        };

        const handleRouteChangeComplete = () => {
            NProgress.done(false);
        };

        Router.events.on('routeChangeStart', handleRouteChangeStart);
        Router.events.on('routeChangeComplete', handleRouteChangeComplete);

        return () => {
            Router.events.off('routeChangeStart', handleRouteChangeStart);
            Router.events.off('routeChangeComplete', handleRouteChangeComplete);
        };
    }, []);

    return (
        <div
            className={`${inter.className} min-h-screen flex flex-col items-center justify-between transition-all dark:transition-all`}
        >
            <DocumentTitle />
            <Head>
                <meta name='description' content='Plan Zajęć UEK' />
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

            <footer className='mt-20 mb-10'>
                <Link
                    href='https://github.com/szczursonn/uek-planzajec'
                    className='hover:opacity-70 opacity-60 dark:opacity-100'
                    target='_blank'
                >
                    <Image
                        src='https://raw.githubusercontent.com/rdimascio/icons/master/icons/github.svg'
                        alt='GitHub logo'
                        width={75}
                        height={75}
                    />
                </Link>
            </footer>
        </div>
    );
};

export default MyApp;
