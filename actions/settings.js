"use server"
import { db } from "@/lib/prisma"
import {auth} from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function getDealerInfo() {

    try {
        const { userId } = await auth()

        if (!userId) throw new Error("Unauthroized")

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        })

        if (!user) throw new Error("User Not Found")


        let dealership = await db.dealerShip.findFirst({
            include: {
                workingHours: {
                    orderBy: {
                        dayOfWeek: "asc",
                    },
                },
            },
        })


        if (!dealership) {
            dealership = await db.dealerShip.create({
                data: {
                    // Default values will be used from schema
                    workingHours: {
                        create: [
                            {
                                dayOfWeek: "MONDAY",
                                openTime: "09:00",
                                closeTime: "18:00",
                                isOpen: true,
                            },
                            {
                                dayOfWeek: "TUESDAY",
                                openTime: "09:00",
                                closeTime: "18:00",
                                isOpen: true,
                            },
                            {
                                dayOfWeek: "WEDNESDAY",
                                openTime: "09:00",
                                closeTime: "18:00",
                                isOpen: true,
                            },
                            {
                                dayOfWeek: "THURSDAY",
                                openTime: "09:00",
                                closeTime: "18:00",
                                isOpen: true,
                            },
                            {
                                dayOfWeek: "FRIDAY",
                                openTime: "09:00",
                                closeTime: "18:00",
                                isOpen: true,
                            },
                            {
                                dayOfWeek: "SATURDAY",
                                openTime: "10:00",
                                closeTime: "16:00",
                                isOpen: true,
                            },
                            {
                                dayOfWeek: "SUNDAY",
                                openTime: "10:00",
                                closeTime: "16:00",
                                isOpen: false,
                            },
                        ],
                    },
                },
                include: {
                    workingHours: {
                        orderBy: {
                            dayOfWeek: "asc",
                        },
                    },
                },
            });
        }
 
        return {
            success: true,
            data: {
                ...dealership,
                createdAt: dealership.createdAt.toISOString(),
                updatedAt: dealership.updatedAt.toISOString(),
            }
        }


    } catch (error) {
        throw new Error("Error fetching in dealership Info" + error.message)
    }

}


export async function saveWorkingHours(workingHours) {
    try {
        const { userId } = await auth()

        if (!userId) throw new Error("Unauthroized")

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        })

        if (!user || user.role !== "ADMIN") {
            throw new Error("User Not Found")
        }

        const dealerShip = await db.dealerShip.findFirst()
        await db.workingHour.deleteMany({
            where: {
                dealershipId: dealerShip.id
            },
        })
        for (const hour of workingHours) {
            console.log(hour)
            await db.workingHour.create({
                data: {
                    dayOfWeek: hour.dayOFWeek,
                    openTime: hour.openTime,
                    closeTime: hour.closeTime,
                    isOpen: hour.isOpen,
                    dealershipId: dealerShip?.id
                }
            })
        }

        revalidatePath("/admin/settings")

        revalidatePath("/")
        return {
            success:true
        }
    } catch (error) {
             console.log(error)
    }
}

export async function getUsers() {
    try {
        const { userId } = await auth()

        if (!userId) throw new Error("Unauthroized")

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        })

        if (!user || user.role !== "ADMIN") {
            throw new Error("User Not Found")
        }

        const users=await db.user.findMany({
            orderBy:{createdAt:"desc"}
        })


        return {
            success:true,
            data:users.map((user)=>{
                return{
                    ...user,
                    createdAt:user.createdAt.toISOString(),
                    updatedAt:user.updatedAt.toISOString()
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

export async function updateUserRole(role)
{
    try {
        const { userId } = await auth()

        if (!userId) throw new Error("Unauthroized")

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        })

        if (!user || user.role !== "ADMIN") {
            throw new Error("User Not Found")
        }

        await db.user.update({
            where:{id:userId},
            data:{role}
        })

        revalidatePath("/admin/settings")

        return {
            success:true
        }
    } catch (error) {
        
        throw new Error("Eror updating the role:"+error.message)
    }
}