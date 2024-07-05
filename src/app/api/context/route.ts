import {NextResponse} from "next/server";
import {getContext} from "@/app/utils/context";
import {ScoredPineconeRecord} from "@pinecone-database/pinecone";
import {Message} from "ai";

export async function POST(req: Request) {
    try {
        const {messages}: [Message] = await req.json();
        const messageCount = messages.length;
        const lastMessage = messageCount > 1 ? messages[messageCount - 1] : messages[0];
        const context = await getContext(lastMessage.content, '', 10000, 0.7, false) as ScoredPineconeRecord[];
        return NextResponse.json({ context});
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: error});
    }
}
