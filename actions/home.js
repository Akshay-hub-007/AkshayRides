"use server"

import aj from "@/lib/arcjet"
import { serializeCarData } from "@/lib/helper"
import { db } from "@/lib/prisma"
import { request } from "@arcjet/next"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { filetoBase64 } from "./cars"

export async function getFeaturedCars(limit = 3) {
    try {
        const cars = await db.car.findMany({
            where: {
                featured: true,
                status: "AVAILABLE"
            },
            take: limit,
            orderBy: { createdAt: "desc" }
        })

        return cars.map(serializeCarData)
    } catch (error) {

        throw new Error("Error fetching featured cars" + error.message);
    }
}

export async function processImageSearch(file) {

    try {
        const req = await request()

        const decision = await aj.protect(req, {
            requested: 1
        })

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                const { remaining, reset } = decision.reason
                console.error({
                    code: "RATE_LIMIT_EXCEEDED",
                    details: {
                        remaining,
                        resetInSeconds: reset
                    }
                })

                throw new Error("Too many requests .Please try again");
            }

            throw new Error("Request blocked");
        }
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Gemini API key not configured")
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const base64 = await filetoBase64(file)
        const imagePart = {
            inlineData: {
                data: base64,
                mimeType: file.type
            }
        }

        const prompt = `
      Analyze this car image and extract the following information for a search query:
      1. Make (manufacturer)
      2. Body type (SUV, Sedan, Hatchback, etc.)
      3. Color

      Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "bodyType": "",
        "color": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
    `;

        // const result = await model.generateContent({
        //     contents: [
        //         {
        //             parts: [
        //                 { text: prompt },
        //                 imagePart
        //             ],
        //             role: "user"
        //         }
        //     ]
        // });

        const result = await model.generateContent([imagePart, prompt])
        const response = await result.response
        const text = response.text()

        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim()

        try {
            const carDetails = JSON.parse(cleanedText)


            return {
                success: true,
                data: carDetails
            }
        } catch (parseError) {
            console.error("Failed to parse the Ai response", parseError)
        }
    } catch (error) {
        console.error("AI Search error" + error.message)
    }
}