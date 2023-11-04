import Head from 'next/head';

const DocumentTitle = ({ title }: { title?: string }) => {
    const documentTitle = `Plan zajęć UEK${title ? ` - ${title}` : ''} `;
    return (
        <Head>
            <title>{documentTitle}</title>
        </Head>
    );
};

export default DocumentTitle;
