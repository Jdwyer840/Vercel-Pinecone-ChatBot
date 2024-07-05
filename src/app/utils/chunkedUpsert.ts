// Index class is used to perform querys agains the pinecone db, upserting etc...
import type { Index, PineconeRecord } from '@pinecone-database/pinecone';

type UpsertResult = PromiseFulfilledResult<any> | PromiseRejectedResult;

const sliceIntoChunks = <T>(arr: T[], chunkSize: number) => {
    return Array.from({ length: Math.ceil(arr.length / chunkSize)}, (_, i) =>
        arr.slice(i * chunkSize, (i + 1) * chunkSize)
    );
}

export const chunkedUpsert = async (
    index: Index,
    vectors: Array<PineconeRecord>,
    namespace: string,
    chunkSize = 10
) => {
    const chunks = sliceIntoChunks(vectors, chunkSize);

    try {
         let chunksUpsertResult: PromiseSettledResult<UpsertResult>[] =  await Promise.allSettled(
            chunks.map(async (chunk) => {
                try {
                    await index.namespace(namespace).upsert(chunk);
                } catch (e) {
                    console.log('Error upserting chunk', e);
                }
            })
        );

         let success = true;

        chunksUpsertResult.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`Chunk ${index} upserted successfully.`);
            } else if (result.status === 'rejected') {
                // TypeScript now knows `result` is of the rejected result type here
                console.log(`Error with chunk ${index}: ${result.reason}`);
                success = false; // Update success status if there is any failure
            }
        });

        return true;
    } catch (error) {
        console.log("something went wrong upserting the pinecone records", error)
    }
}
