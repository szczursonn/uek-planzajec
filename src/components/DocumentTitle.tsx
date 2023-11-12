import Head from 'next/head';

const DocumentTitle = ({ title }: { title?: string }) => {
    const documentTitle = `${title ? `${title} | ` : ''}Plan zajęć UEK`;
    return (
        <Head>
            <title>{documentTitle}</title>
        </Head>
    );
};

export default DocumentTitle;
