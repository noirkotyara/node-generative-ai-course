import { generateEmbeddings, loadData } from "../main";
import {cosineSimilarity} from "../similar";

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

console.log(`What type of movie do you want to watch?`);

process.stdin.addListener('data', async function(input) {
    const userInput = input.toString().trim();
    const embeddingsData = loadData<MovieDataWithEmbeddings>('movies_project/movies-embeddings.json')
    const moviesData = loadData<Movie[]>('movies_project/movies.json')

    const inputEmbedding = await generateEmbeddings(userInput);

    const similarities: {
        input: string,
        similarity: number
    }[] = [];

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

    console.log('The most suitable movies for you are: \n')
    const sortedSimilarities = similarities.sort((a, b) => b.similarity - a.similarity);
    sortedSimilarities.forEach(similarity => {
        console.log(`${similarity.input}: ${similarity.similarity}`);
    })
})