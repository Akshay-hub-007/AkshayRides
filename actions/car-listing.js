"use server"
import { serializeCarData } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getCarFilters() {

    try {
        const makes = await db.car.findMany({
            where: { status: "AVAILABLE" },
            select: { make: true },
            distinct: ["make"],
            orderBy: { make: "asc" }
        })
        console.log(makes)
        const bodyTypes = await db.car.findMany({
            where: { status: "AVAILABLE" },
            select: { bodyType: true },
            distinct: ["bodyType"],
            orderBy: { bodyType: "asc" }
        })
        console.log((bodyTypes) + "bodyTypes")
        const fuelTypes = await db.car.findMany({
            where: { status: "AVAILABLE" },
            select: { fuelType: true },
            distinct: ["fuelType"],
            orderBy: { fuelType: "asc" }
        })

        const transmissions = await db.car.findMany({
            where: { status: "AVAILABLE" },
            select: { transmission: true },
            distinct: ["transmission"],
            orderBy: { transmission: "asc" }
        })

        const priceAggregations = await db.car.aggregate({
            where: { status: "AVAILABLE" },
            _min: { price: true },
            _max: { price: true }
        })

        return {
            success: true,
            data: {
                makes: makes.map((item) => item.make),
                bodyTypes: bodyTypes.map((item) => item.bodyType),
                fuelTypes: fuelTypes.map((item) => item.fuelType),
                transmissions: transmissions.map((item) => item.transmission),
                priceRange: {
                    min: priceAggregations._min.price
                        ? parseFloat(priceAggregations._min.price.toString()) : 0,
                    max: priceAggregations._max.price
                        ? parseFloat(priceAggregations._max.price.toString()) : 100000,
                }
            }

        }
    } catch (error) {
        throw new Error("Error fetching car filters:" + error.message);

    }

}


export async function getCars({
    search = "",
    make = "",
    bodyType = "",
    fuelType = "",
    transmission = "",
    minPrice = 0,
    maxPrice = Number.MAX_VALUE,
    sortBy = "newest",
    page = 1,
    limit = 6
}) {
    try {

        const { userId } = await auth()
        let dbUser = null
        if (userId) {
            dbUser = await db.User.findUnique({
                where: { clerkUserId: userId }
            })
        }


        let where = {
            status: "AVAILABLE"
        }

        if (search) {
            where.OR = [
                { make: { contains: search, mode: "insensitive" } },
                { model: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } }
            ];
        }

        if (make) where.make = { equals: make, mode: "insensitive" };
        if (bodyType) where.bodyType = { equals: bodyType, mode: "insensitive" }
        if (fuelType) where.fuelType = { equals: fuelType, mode: "insensitive" }
        if (transmission)
            where.transmission = { equals: transmission, mode: "insensitive" }
        where.price = {
            gte: parseFloat(minPrice) || 0
        }

        if (maxPrice && maxPrice < Number.MAX_SAFE_INTEGER) {
            where.price.lte = parseFloat(maxPrice)
        }

        let orderBy = {}

        switch (sortBy) {
            case "priceAsc":
                orderBy = { price: "asc" };
                break;
            case "priceDesc":
                orderBy = { price: "desc" }
                break;
            case "newest":
            default:
                orderBy = { createdAt: "desc" };
                break;
        }


        const skip = (page - 1) * 6

        const totalCars = await db.car.count({ where })

        const cars = await db.car.findMany({
            where: where,
            take: limit,
            skip,
            orderBy,
        })

        let wishlisted = new Set()

        if (dbUser) {
            const savedCars = await db.userSavedCar.findMany({
                where: { userId: dbUser.id },
                select: { carId: true }
            })
            wishlisted = new Set(savedCars.map((saved) => saved.carId))

        }

        const serializedCars = cars.map((car) =>
            serializeCarData(car, wishlisted.has(car.id))
        );

        return {
            success: true,
            data: serializedCars,
            pagination: {
                total: totalCars,
                page,
                limit,
                pages: Math.ceil(totalCars / limit)
            },
        }
    } catch (error) {
        throw new Error("Error in fetching cars:" + error.message)
    }
}




export async function toggleSavedCars(carId) {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error("Unauthroized")

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });



        if (!user) throw new Error("User Not Found")

        const car = await db.car.findUnique({
            where: { id: carId }
        })

        if (!car) {
            return {
                success: false,
                error: "Car not Found"
            }
        }

        const existingCars = await db.userSavedCar.findUnique({
            where: {
                userId_carId: {
                    userId: user.id,
                    carId,
                }
            }
        })

        if (existingCars) {
            await db.userSavedCar.delete({
                where: {
                    userId_carId: {
                        userId: user.id,
                        carId,
                    }
                }
            })

            revalidatePath("/saved-cars")

            return {
                success: true,
                saved: false,
                message: "Car removed from favorites"
            };
        }

        await db.userSavedCar.create({
            data: {
                userId: user.id,
                carId
            }
        })

        revalidatePath("/saved-cars")
        return {
            success: true,
            saved: true,
            message: "Car added to favorites"
        }

    } catch (error) {

        throw new Error("Error toggling saved car:" + error.message);
    }
}