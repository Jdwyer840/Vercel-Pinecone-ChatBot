import {Pinecone, type ScoredPineconeRecord} from "@pinecone-database/pinecone";

export type Metadata = {
    url: string,
    text: string,
    chunk: string,
    hash: string
}

const getMatchesFromEmbeddings = async (embeddings: number[], topK: number, namespace: string): Promise<ScoredPineconeRecord<Metadata>[]> => {

        const pinecone = new Pinecone();

        const indexName = (process.env.PINECONE_INDEX || '').trim();
        if (indexName === '') {
            throw Error("Environment variable is not set or is empty: PINECONE_INDEX");
        }

        const indexes = (await pinecone.listIndexes())?.indexes;
        if (indexes || indexes.filter(i => i.name === indexName).length !== 1) {
            throw new Error(`Index ${indexName} does not exist`);
        }

        const index = pinecone!.Index<Metadata>(indexName);

        const pineconeNamespace = index.namespace(namespace ?? '');

        try {
            const queryResult = await pineconeNamespace.query(({
                vector: embeddings,
                topK,
                includeMetadata: true,
            }))
            return queryResult.matches || []
        } catch (error) {
            console.log("Error querying embeddings: ", error);
            throw new Error(`Error querying embeddings: ${error}`);
        }
}

export { getMatchesFromEmbeddings}
