import { OpenAI } from 'openai'
import * as fs from "node:fs";
import {Image} from "openai/src/resources/images";
import {createReadStream} from "node:fs";

const openAI = new OpenAI();
const model = 'dall-e-2';

export function validateImageResponse(
    response: unknown
): asserts response is (OpenAI.Images.ImagesResponse & { data: Array<Image & { b64_json: string }> }){
    if (
        !response ||
        typeof response !== "object" ||
        !("data" in response) ||
        !Array.isArray((response as any).data) ||
        (response as any).data.length === 0 ||
        typeof (response as any).data[0]?.b64_json !== "string"
    ) {
        throw new Error("Invalid images response: data[0].b64_json missing");
    }
}

function createImageFile(
    response: OpenAI.Images.ImagesResponse,
    fileName: string
) {
    validateImageResponse(response)

    const image_base64 = response.data[0].b64_json;
    const image_bytes = Buffer.from(image_base64, "base64");
    fs.writeFileSync(fileName, image_bytes);
}

async function generateImage() {
    const response = await openAI.images.generate({
        prompt: 'Generate image of cat on the sofa',
        model,
        size: "256x256",
        response_format: 'b64_json',
        n: 1,
    })

    createImageFile(response, "generated.png")
}

async function generateImageVariations() {
    const response = await openAI.images.createVariation({
        model,
        image: createReadStream("generated.png"),
        response_format: 'b64_json',
    })

    createImageFile(response, "generatedVariation.png")
}

generateImageVariations();

