"use server"
import { serializeCarData } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from 'uuid';

async function filetoBase64(file) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes);
    return buffer.toString("base64")
}
export async function processCarImageWithAI(file) {
    try {
        console.log(file)
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
      Analyze this car image and extract the following information:
      1. Make (manufacturer)
      2. Model
      3. Year (approximately)
      4. Color
      5. Body type (SUV, Sedan, Hatchback, etc.)
      6. Mileage
      7. Fuel type (your best guess)
      8. Transmission type (your best guess)
      9. Price (your best guess)
      9. Short Description as to be added to a car listing

      Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "model": "",
        "year": 0000,
        "color": "",
        "price": "",
        "mileage": "",
        "bodyType": "",
        "fuelType": "",
        "transmission": "",
        "description": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
    `;

        const result = await model.generateContent({
            contents: [
                {
                    parts: [
                        { text: prompt },
                        imagePart
                    ],
                    role: "user"
                }
            ]
        });

        const response = await result.response
        const text = response.text()

        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim()

        try {
            const carDetails = JSON.parse(cleanedText);

            // Validate the response format
            const requiredFields = [
                "make",
                "model",
                "year",
                "color",
                "bodyType",
                "price",
                "mileage",
                "fuelType",
                "transmission",
                "description",
                "confidence",
            ];

            const missingFields = requiredFields.filter(
                (field) => !(field in carDetails)
            );

            if (missingFields.length > 0) {
                throw new Error(
                    `AI response missing required fields: ${missingFields.join(", ")}`
                );
            }

            // Return success response with data
            return {
                success: true,
                data: carDetails,
            };
        } catch (parseError) {
            console.error("Failed to parse AI response:", parseError);
            console.log("Raw response:", text);
            return {
                success: false,
                error: "Failed to parse AI response",
            };
        }

    } catch (error) {
        throw new Error("Gemini API error:" + error.message);

    }
}

export async function addCar({ carData, uploadedImages: images }) {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error("Unauthroized")

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });



        if (!user) throw new Error("User Not Found")

        const carId = uuidv4()
        const folderPath = `cars/${carId}`;
        const cookieStore = await cookies()
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Supabase URL or Key is missing");
        }
        const supabase = createClient(supabaseUrl, supabaseKey);

        const imageurls = []

        for (let i = 0; i < images.length; i++) {
            const base64Data = images[i];
            if (!base64Data || !base64Data.startsWith("data:image/")) {
                console.warn("Skipping invalid image file");
                continue;
            }

            const base64 = base64Data.split(",")[1];
            const imageBuffer = Buffer.from(base64, "base64");

            const mimeMatch = base64Data.match(/data:image\/([a-zA-Z0-9]+);/);
            const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";
            const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
            const filePath = `${folderPath}/${fileName}`;

            const { error } = await supabase.storage
                .from("car-image")
                .upload(filePath, imageBuffer, {
                    contentType: `image/${fileExtension}`,
                });

            if (error) {
                console.error("Error uploading image:", error);
                throw new Error(`Failed to upload image: ${error.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
                .from("car-image")
                .getPublicUrl(filePath);

            imageurls.push(publicUrl);
        }

        if (imageurls.length === 0) {
            throw new Error("No valid images were uploaded");
        }
        // Add the car to the database
        const car = await db.car.create({
            data: {
                id: carId, // Use the same ID we used for the folder
                make: carData.make,
                model: carData.model,
                year: carData.year,
                price: carData.price,
                mileage: carData.mileage,
                color: carData.color,
                fuelType: carData.fuelType,
                transmission: carData.transmission,
                bodyType: carData.bodyType,
                seats: carData.seats,
                description: carData.description,
                status: carData.status,
                featured: carData.featured,
                images: imageurls,
            },
        });


        // revalidatePath("/actions/cars")

        return {
            success: true
        }
    } catch (error) {
        throw new Error("Error adding car " + error?.message || error)
    }
}


export async function getCars(search = "") {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error("Unauthroized")

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });


        if (!user) throw new Error("User Not Found")

        const where = {}
        if (search) {
            where.OR = [
                { make: { contains: search, mode: "insensitive" } },
                { model: { contains: search, mode: "insensitive" } },
                { color: { contains: search, mode: "insensitive" } }
            ]
        }

        const cars = await db.car.findMany({
            where,
            orderBy: { createdAt: "desc" }
        })

        const serializeCars = cars.map(serializeCarData)
        return { success: true, data: serializeCars }
    } catch (error) {
        console.log("Error in fetching Cars "+error.message)


        return {
            success: false,
            error: error.message
        }
    }
}

export async function deleteCar(id) {

    try {


        const { userId } = await auth()
        if (!userId) throw new Error("Unauthroized")

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });



        if (!user) throw new Error("User Not Found")

        const car = await db.car.findUnique({
            where: { id },
            select: { images: true }
        })

        if (!car) {
            return {
                success: false,
                error: "Car Not Found"
            }
        }

        await db.car.delete({
            where: { id },
        })

        try {

            const cookieStore = await cookies()

            const supabase = createClient(supabaseUrl, supabaseKey);

            const filePaths = car.images.map((imageUrl) => {

                const url = new URL(imageUrl)
                const pathname = url.pathname.match(/\/car-images\/(.*)/)

                return pathname ? [1] : null
            }).filter(Boolean)

            if (filePaths.length > 0) {
                const { error } = await supabase.storage.from("car-images").remove(filePaths)

                if (error) {
                    console.log('error in deleting images', error)
                }
            }
        } catch (storageError) {

            console.log("Error in deleting Storage" + storageError.message)

            return {
                success: false,
                error: storageError.message
            }
        }

        revalidatePath("/admin/cars")
    } catch (error) {
        console.log("Error in deleting Storage" + error.message)

        return {
            success: false,
            error: error.message
        }

    }
}

export async function updateCar(id,{status,featured})
{
    try {
        

        const { userId } = await auth()
        if (!userId) throw new Error("Unauthroized")

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });



        if (!user) throw new Error("User Not Found")

        const updated={}
        if(status!=undefined)
        {
            updated.status=status;
        }

        if(featured!=undefined)
        {
            updated.featured=featured
        }

        await db.car.update({
            where:{id},
            data:updated
        })


        revalidatePath("/admin/cars");

        return {
            success:true
        }
    } catch (error) {

        console.log("error in updating cars",error.message)
        return {
            success:false,
            error:error.message
        }
    }
}
