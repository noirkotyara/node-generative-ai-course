import { generateEmbeddings, loadData } from "../main";
import { cosineSimilarity } from "../similar";
import OpenAI from "openai";

interface Movie {
    name: string,
    description: string,
}
interface MovieDataWithEmbeddings {
    object: string,
    data: {
        object: string,
        index: 0,
        embedding: number[]
    }[]
}
interface SimilarityItem {
    input: string,
    similarity: number
}

console.log(`What type of movie do you want to watch?`);

function printRecommendedMovies(similarities: SimilarityItem[]) {
    console.log('The most suitable movies for you are: \n')
    const sortedSimilarities = similarities.sort((a, b) => b.similarity - a.similarity);
    sortedSimilarities.forEach(similarity => {
        console.log(`${similarity.input}: ${similarity.similarity}`);
    })
}

function calculateSimilarity(
    inputEmbedding: OpenAI.CreateEmbeddingResponse,
) {
    const embeddingsData = loadData<MovieDataWithEmbeddings>('movies_project/movies-embeddings.json')
    const moviesData = loadData<Movie[]>('movies_project/movies.json')

    const similarities: SimilarityItem[] = [];

    for (const movieEmbedding of embeddingsData.data) {
        const similarity = cosineSimilarity(
            movieEmbedding.embedding,
            inputEmbedding.data[0].embedding
        )
        similarities.push({
            input: moviesData[movieEmbedding.index].name,
            similarity
        })
    }

    return similarities;
}

process.stdin.addListener('data', async function(input) {
    const userInput = input.toString().trim();

    const inputEmbedding = await generateEmbeddings(userInput);

    const similarities = calculateSimilarity(inputEmbedding);

    printRecommendedMovies(similarities);
})