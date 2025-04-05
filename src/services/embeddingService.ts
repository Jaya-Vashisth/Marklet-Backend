import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
const model = ai.getGenerativeModel({model:"text-embedding-004"})

const truncate = (text:string, maxBytes:number):string =>{

    const encoder = new TextEncoder();
    const encoded = encoder.encode(text);

    if(encoded.length <= maxBytes) return text;


    return new TextDecoder().decode(encoded.slice(0,maxBytes))
}

export const getEmbedding = async (text:string):Promise<number[]> =>{

    try{
        const truncatedText = truncate(text, 9_000);
        const response = await model.embedContent(truncatedText);

        return response.embedding.values;
    }catch(error:any){
        console.error("Error getting embedding:", error.message);
        throw new Error("Failed to get embedding");
    }
}