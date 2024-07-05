import { NextResponse } from "next/server";
import { Pinecone } from '@pinecone-database/pinecone'

export async function POST() {
    const pinecone = new Pinecone();

    const index = pinecone.index(process.env.PINECONE_INDEX!);

    const namespaceName = process.env.PINECONE_NAMESPACE ?? "";
    const namespace = index.namespace(namespaceName);

    await namespace.deleteAll();

    return NextResponse.json({
        success: true
    })
}
