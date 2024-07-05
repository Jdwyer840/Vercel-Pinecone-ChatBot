import getEmbeddings from "../../utils/embeddings";
import { Document, MarkdownTextSplitter, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter";
import { Pinecone, PineconeRecord, ServerlessSpecCloudEnum } from "@pinecone-database/pinecone";
import { chunkedUpsert } from '../../utils/chunkedUpsert'
import md5 from "md5";
import { Crawler, Page } from "./crawler";
import { truncatedStringByBytes } from "../../utils/truncateString"

interface SeedOptions {
    splittingMethod: string,
    chunkSize: number,
    chunkOverlay: number
}

type DocumentSplitter = RecursiveCharacterTextSplitter | MarkdownTextSplitter;


async function seed(url: string, limit: number, indexName: string, cloudName: ServerlessSpecCloudEnum, regionName: string, options: SeedOptions){
    try {
        const pinecone = new Pinecone();

        const { splittingMethod, chunkSize, chunkOverlap } = options;

        const crawler = new Crawler(1, limit || 100);

        await crawler.crawl(url);

        const pages = crawler.getPages();

        const splitter: DocumentSplitter = splittingMethod === 'recursive' ? new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap }) : new MarkdownTextSplitter();

        const documents = await Promise.all(pages.map(page => prepareDocument(page, splitter)));



        const indexList: string[] = (await pinecone.listIndexes())?.indexes?.map(index => index.name) || [];

        const indexExists = indexList.includes(indexName);
        !indexExists && await pinecone.createIndex({
            name: indexName,
            dimension: 1536,
            waitUntilReady: true,
            spec: {
                serverless: {
                    cloud: cloudName,
                    region: regionName
                }
            }
        });

        const index = pinecone.Index(indexName)

        const vectors = await Promise.all(documents.flat().map(embedDocument));

        await chunkedUpsert(index!, vectors, '', 10);

        return[0];

    } catch (error: Error | any) {
        console.log('error seeding ', error);
        throw error;
    }
}

async function embedDocument(doc: Document): Promise<PineconeRecord> {
    try {

        const embedding = await getEmbeddings(doc.pageContent);

        const hash = md5(doc.pageContent);

        return {
            id: hash,
            values: embedding,
            metadata: {
                chunk: doc.pageContent,
                text: doc.metadata.text as string,
                url: doc.metadata.url as string,
                hash: doc.metadata.hash as string
            }
        } as PineconeRecord;

    } catch (error) {
        console.log("Error embedding document: ", error);
        throw error;
    }
}

async function prepareDocument(page: Page, splitter: DocumentSplitter): Promise<Document[]> {
    const pageContent = page.content;

    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                url: page.url,
                text: truncatedStringByBytes(pageContent, 36000)
            },
        }),
    ]);

    return docs.map((doc: Document) => {
        return {
            pageContent: doc.pageContent,
            metadata: {
                ...doc.metadata,
                hash: md5(doc.pageContent)
            },
        };
    });
}

export default seed;
