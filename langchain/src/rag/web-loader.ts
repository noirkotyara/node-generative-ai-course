import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import {
    StringOutputParser,
} from "@langchain/core/output_parsers";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const llm = new ChatOpenAI({
    model: "gpt-4",
    temperature: 0.2,
    verbose: true,
})

async function main() {
    const loader = new CheerioWebBaseLoader('https://pixly-kit.vercel.app/')
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 200,
        chunkOverlap: 20
    })

    const splitDocs = await splitter.splitDocuments(docs)

    // create memory vector store
    const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());

    // fill memory vector store with documents
    await vectorStore.addDocuments(splitDocs)

    const question = 'What does pixly kit means?'

    //get retriever to get relevant documents based on question
    const retriever = vectorStore.asRetriever({
        k: 2
    })
    const relevantQuestionDocuments = await retriever._getRelevantDocuments(question)

    const prompt = ChatPromptTemplate.fromMessages([
        ['system', 'Answer on the question based on provided context {context}'],
        ['user', '{question}']
    ])

    const parser = new StringOutputParser()
    const chain = prompt
        .pipe(llm)
        .pipe(parser)

    const response = await chain.invoke({
        context: relevantQuestionDocuments.map(doc => doc.pageContent).join(','),
        question,
    })

    console.log('[main:response]', response)
}

main();
