import OpenAI from "openai";
import path from "node:path";
import {readFileSync} from "fs";
import {writeFileSync} from "node:fs";

const EMBEDDINGS_MODEL: OpenAI.Embeddings.EmbeddingModel = 'text-embedding-3-small'

const openAI = new OpenAI();

async function generateEmbeddings(input: string | string[]) {
    return openAI.embeddings.create({
        input: input,
        model: EMBEDDINGS_MODEL,
    })
}

function loadData<T>(fileName: string): T {
    const dataFilePath = path.join(__dirname, fileName)
    const rawFileData = readFileSync(dataFilePath)
    console.log('[loadData:success]', `Data is loaded from ${dataFilePath}`)

    return JSON.parse(rawFileData.toString())
}

function saveToFile(
    data: unknown,
    fileName: string,
) {
    const dataString = JSON.stringify(data)
    const dataBuffer = Buffer.from(dataString)
    const filePath = path.join(__dirname, fileName)
    writeFileSync(filePath, dataBuffer)
    console.log('[saveToFile:success]', `File is created at ${filePath} `)
}

async function main() {
    const data = loadData<string[]>("data.json")
    const response = await generateEmbeddings(data)

    const dataEmbeddingsToSave = response.data.map((dataItem, dataItemIdx) => ({
        input: data[dataItemIdx],
        embedding: dataItem.embedding
    }))

    saveToFile(dataEmbeddingsToSave, "data-embeddings.json")
}

main()
