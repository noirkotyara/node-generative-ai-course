import { Pinecone } from '@pinecone-database/pinecone';
import { infoRecordsMetadata, InfoMetadata } from "../data/data";
import OpenAI from "openai";
import Chat, { ChatModel } from "../chroma/chat";

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});
const openAI = new OpenAI()
const INDEX_NAME = 'developer-quickstart-ts-2';
const INDEX_01_NAMESPACE = 'test01';
const EMBEDDING_MODEL: OpenAI.Embeddings.EmbeddingModel = 'text-embedding-3-small';
const CHAT_MODEL = 'gpt-4';

async function createIndex() {
    await pinecone.createIndex({
        name: INDEX_NAME,
        vectorType: 'dense',
        dimension: 1536,
        metric: 'cosine',
        spec: { serverless: { cloud: 'aws', region: 'us-east-1' } },
        deletionProtection: 'disabled',
        tags: { environment: 'development' },
        waitUntilReady: true,
    });

    console.log(`Index:${INDEX_NAME} created successfully.`);
}

async function createNamespace() {
    const index = pinecone.index<InfoMetadata>(INDEX_NAME)
    index.namespace(INDEX_01_NAMESPACE)

    console.log(`Namespace:${INDEX_01_NAMESPACE} created successfully.`);
}

async function fulfillIndexNamespaceWithData() {
    const collection = pinecone
        .index<InfoMetadata>(INDEX_NAME)
        .namespace(INDEX_01_NAMESPACE)

    await Promise.all(infoRecordsMetadata.map(async (infoRecord, infoRecordIdx) => {
        const embeddingResult = await openAI.embeddings.create({
            input: infoRecord.info,
            model: EMBEDDING_MODEL,
        })

        const embeddingData = embeddingResult.data[0].embedding

        await collection.upsert([{
            id: `id-${infoRecordIdx}`,
            values: embeddingData,
            metadata: infoRecord,
        }])
    }))
}

async function findRelevantContext(
    question: string
) {
    const collection = pinecone
        .index<InfoMetadata>(INDEX_NAME)
        .namespace(INDEX_01_NAMESPACE)

    const questionEmbedding = await openAI.embeddings.create({
        input: question,
        model: EMBEDDING_MODEL,
    })

    const relevantContextResult = await collection.query({
        topK: 3,
        vector: questionEmbedding.data[0].embedding,
        includeMetadata: true,
        includeValues: true,
    })
    return relevantContextResult.matches[0].metadata
}

async function askOpenAI(
    question: string,
    relevantContext: InfoMetadata,
) {
    const chat = new Chat(CHAT_MODEL, 500);
    chat.pushToContext({
        role: 'system',
        content: `Answer the next question using this information: ${relevantContext.info}`
    })

    chat.pushToContext({
        role: 'user',
        content: question
    })

    const response = await chat.provideChatCompletion({
        temperature: 0,
        n: 1,
    })

    return response.choices[0].message.content
}

async function main() {
    // await createIndex()
    // await createNamespace()
    // await fulfillIndexNamespaceWithData()

    const question = 'What does Alexandra like to do when she is not in university?'
    const relevantContext = await findRelevantContext(question)

    if (!relevantContext) {
        console.log('[main:result]', 'No relevant context was found for the asked question')
        return;
    }

    const result = await askOpenAI(
        question,
        relevantContext
    )
    console.log('[main:result]', result)
}

main()
