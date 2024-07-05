import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(config);

export default async function getEmbeddings(input: string) {
    try {
        const response = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: input.replace(/\n/g, ' ')
        });

        const result = await response.json();

        console.log('result')
        console.log(result)


        return result.data[0].embedding as number[];
    } catch (error) {
        console.log("Error calling OpenAI embedding API: ", error);
        throw new Error(`Error calling OpenAI embedding API: ${error}`);
    }
}
