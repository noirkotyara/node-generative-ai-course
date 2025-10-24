import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import {
    StringOutputParser,
} from "@langchain/core/output_parsers";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import path from "node:path";
import {Document} from "@langchain/core/documents";

const llm = new ChatOpenAI({
    model: "gpt-4",
    temperature: 0.2,
    verbose: true,
})

async function main() {
    const pdfFilePath = path.join(__dirname, "books.pdf")
    const loader = new PDFLoader(pdfFilePath, {
        splitPages: false,
    })
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
        separators: ['. /n']
    })

    const splitDocs = await splitter.splitDocuments(docs)
    const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" })
    const dbConfig = {
        collectionName: "books_with_embeddings_9",
        clientParams: {
            host: "localhost",
            port: 8000,
        },
    };
    const vectorStore = new Chroma(embeddings, dbConfig);
    await vectorStore.addDocuments(splitDocs.map(doc => (
        new Document({ pageContent: doc.pageContent, metadata: doc.metadata.source || 'default-metadata' })
    )))

    const question = 'What themes does Gone with the Wind explore?'

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
        context: relevantQuestionDocuments.map((doc) => doc.pageContent).join(','),
        question,
    })

    console.log('[main:response]', response)
}

main();
