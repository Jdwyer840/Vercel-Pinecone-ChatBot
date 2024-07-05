import {ScoredPineconeRecord} from "@pinecone-database/pinecone";
import { getMatchesFromEmbeddings} from "@/app/utils/pinecone";
import { getEmbeddings } from './embeddings';

export type Metadata = {
    url: string,
    test: string,
    chunk: string,
}

export const getContext = async (message: string, namespace: string, maxTokens = 3000, minScore = 0.7, getOnlyText = true): Promise<string | ScoredPineconeRecord[]> => {

    const  embedding = await getEmbeddings(message);

    const matches = await getMatchesFromEmbeddings(embedding, 3 , namespace);

    const qualifyingDocs = matches.filter(m => m.score && m.score > minScore);

    if (!getOnlyText) {
        return qualifyingDocs
    }

    let docs = matches? qualifyingDocs.map(match => (match.metadata as Metadata).chunk) : [];

    return docs.join("\n").substring(0, maxTokens);


}
