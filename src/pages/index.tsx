import { type GetServerSideProps } from 'next';

export const runtime = 'experimental-edge';

export default function HomePage() {
    return <></>;
}

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async () => {
    return {
        redirect: {
            destination: '/pick',
            permanent: true,
        },
    };
};
