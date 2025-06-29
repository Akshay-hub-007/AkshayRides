"use server"

import { serializeCarData } from "@/lib/helper"
import { db } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function bookTestDrive({
    carId,
    bookingDate,
    startTime,
    endTime,
    notes
}) {
    try {
        console.log(carId,bookingDate,startTime,endTime,notes)
        const { userId } = await auth()

        if (!userId) throw new Error("You must be logged in to booka  a test drive")

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        })

        if (!user) throw new Error("User not found")

        const car = await db.car.findUnique({
            where: { id: carId, status: "AVAILABLE" }
        })

        if (!car) throw new Error("Car not available in database")


        const existingBooking = await db.testDriveBooking.findFirst({
            where: {
                carId,
                bookingDate: new Date(bookingDate),
                startTime,
                status: { in: ["PENDING", "CONFIRMED"] }
            }
        })

        if (existingBooking) {
            throw new Error(
                "this slot is already booked.Please another time."
            )
        }

        const booking = await db.testDriveBooking.create({
            data: {
                carId,
                userId: user.id,
                bookingDate: new Date(bookingDate),
                startTime,
                endTime,
                notes: notes || "",
                status: "PENDING",
            }
        })

        revalidatePath(`/test-drive/${carId}`)
        revalidatePath(`/cars/${carId}`)

        return {
            success: true,
            data: booking
        }
    } catch (error) {
        console.error("Error booking in testDrive",error)

        return {
            success: false,
            error: error.message || "Failed to book test drive."
        }
    }
}


export async function getUserTestDrive() {
    try {
        const { userId } = await auth()

        if (!userId) throw new Error("You must be logged in to booka  a test drive")

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        })

        if (!user) throw new Error("User not found")
        const bookings = await db.testDriveBooking.findMany({
            where: { userId: user.id },
            include: {
                car: true
            },
            orderBy: { bookingDate: "desc" }
        })

        const formattedBookings = bookings.map((booking) => ({
            id: booking.id,
            carId: booking.carId,
            car: serializeCarData(booking.car),
            bookingDate: booking.bookingDate.toISOString(),
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status,
            notes: booking.notes,
            createdAt: booking.createdAt.toISOString(),
            updatedAt: booking.updatedAt.toISOString(),
        }));
   console.log(formattedBookings,"formattted")
        return {
            success: true,
            data: formattedBookings,
        };
    } catch (error) {
        console.log("Error in booking test drive", error)
        return {
            success: false,
            error: error.message
        }
    }
}


export async function cancelBookDrive(bookingId) {
    try {
        const { userId } = await auth()

        if (!userId) throw new Error("You must be logged in to booka  a test drive")

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        })

        if (!user) throw new Error("User not found")

        const booking = await db.testDriveBooking.findUnique({
            where: { id: bookingId }
        })


        if (booking) {
            return {
                success: false, error: "Booking not found."
            }
        }

        if (booking.userId !== user.id || user.role !== "ADMIN") {
            return {
                success: false,
                error: "Unauthorized to cancel this booking",
            };
        }

        // Check if booking can be cancelled
        if (booking.status === "CANCELLED") {
            return {
                success: false,
                error: "Booking is already cancelled",
            };
        }

        if (booking.status === "COMPLETED") {
            return {
                success: false,
                error: "Cannot cancel a completed booking",
            };
        }

        // Update the booking status
        await db.testDriveBooking.update({
            where: { id: bookingId },
            data: { status: "CANCELLED" },
        });

        // Revalidate paths
        revalidatePath("/reservations");
        revalidatePath("/admin/test-drives");

        return {
            success: true,
            message: "Test drive cancelled successfully",
        };
    } catch (error) {
        console.error("Error cancelling test drive:", error);
        return {
            success: false,
            error: error.message,
        };
    }
}