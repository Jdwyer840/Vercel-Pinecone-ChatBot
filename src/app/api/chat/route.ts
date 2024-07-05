import { Configuration, OpenAIApi} from 'openai-edge';
import { Message, OpenAIStream, StreamingTextResponse } from "ai";

// Create an OpenAi API, edge friendly, client.
const config = new Configuration(({
    apiKey: process.env.OPENAI_API_KEY
}))
const openai =  new OpenAIApi(config);

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        // The message sent from the user
        const {messages} = await req.json();

        // initial setup or context provided to the model. It typically includes instructions or background information that sets the stage for the conversation.
        const prompt = {
            role: "system",
            content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      `
        }

        const response  = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            stream: true,
            messages: [
                ...prompt,
                ...messages.filter((message: Message) => message.role === "user"),
            ],
        });
        // A stream is what youd think maybe. sinstead of waiting for the entire response, you get the data sent in a stream as it is produced.
        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);
    } catch (e) {
        console.log('Exception occurred in the api / chat / post function')
        throw e;
    }
}
