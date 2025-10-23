import { ChromaClient } from "chromadb";
import { OpenAIEmbeddingFunction } from "@chroma-core/openai";
import { clubInfo, studentInfo, universityInfo } from "./data";
import Chat from "./chat";

const chromaClient = new ChromaClient({
    host: "localhost",
    port: 8000,
});

const COLLECTION_NAME = "collection_with_openai"

async function createCollection() {
    const collectionResponse = await chromaClient.createCollection({
        name: COLLECTION_NAME,
        embeddingFunction: new OpenAIEmbeddingFunction({
            apiKey: process.env.OPENAI_API_KEY,
            modelName: "text-embedding-3-small",
        })
    })

    console.log('heartbeat:main', { collectionResponse })
}

async function getCollection() {
    return chromaClient.getCollection({
        name: COLLECTION_NAME
    });
}

async function addData() {
    const collection = await getCollection();
    await collection.add({
        ids: ['id-1', 'id-2', 'id-3'],
        documents: [studentInfo, clubInfo, universityInfo],
    })
}

async function main() {
    const question = 'What does Alexandra like to do when she is not in university?'

    const collection = await getCollection();

    const questionQuery = await collection.query({
        queryTexts: [question],
        nResults: 1,
        ids: ["id-1", "id-2", "id-3"]
    })

    const queryResult = questionQuery.documents[0][0]
    console.log('[main:queryResult]', queryResult)

    if (!queryResult) {
        console.log('[main:queryResult]', 'No relevant context results were found')
        return;
    }

    const chat = new Chat('gpt-4', 500);
    chat.pushToContext({
        role: 'system',
        content: `Answer the next question using this information: ${queryResult}`
    })

    chat.pushToContext({
        role: 'user',
        content: question
    })

    const response = await chat.provideChatCompletion({
        temperature: 0,
        n: 1,
    })

    console.log('[main:result]', response.choices[0].message.content)
}

main()
