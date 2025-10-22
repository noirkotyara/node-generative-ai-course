import { DataWithEmbedding, generateEmbeddings, loadData } from "./main";

export function dotProduct(a: number[], b: number[]) {
    return a.map((value, index) => value * b[index]).reduce((a, b) => a + b, 0);
}

export function cosineSimilarity(a: number[], b: number[]) {
    const product = dotProduct(a, b);
    const aMagnitude = Math.sqrt(a.map(value => value * value).reduce((a, b) => a + b, 0));
    const bMagnitude = Math.sqrt(b.map(value => value * value).reduce((a, b) => a + b, 0));
    return product / (aMagnitude * bMagnitude);
}

async function main() {
    const embeddingsData = loadData<DataWithEmbedding[]>('data-embeddings.json')

    const input = 'animal';

    const inputEmbedding = await generateEmbeddings(input);

    const similarities: {
        input: string,
        similarity: number
    }[] = [];

    for (const dataItem of embeddingsData) {
        const similarity = cosineSimilarity(
            dataItem.embedding,
            inputEmbedding.data[0].embedding
        )
        similarities.push({
            input: dataItem.input,
            similarity
        })
    }

    console.log('[similarity:calculation]', `Similarity of ${input} with:`)
    const sortedSimilarities = similarities.sort((a, b) => b.similarity - a.similarity);
    sortedSimilarities.forEach(similarity => {
        console.log(`${similarity.input}: ${similarity.similarity}`);
    })
}

// main()