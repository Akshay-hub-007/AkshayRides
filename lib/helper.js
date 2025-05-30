
export const serializeCarData = (car, wishlisted = false) => {
    console.log(car)
    return {
        ...car,
        price: car.price ? parseFloat(car.price.toString()) : 0,
        createdAt: car?.createdAt.toISOString() ,
        updatedAt: car?.updatedAt.toISOString() ,
        wishlisted: wishlisted,
    }
}

export function formatCurrency(amount) {

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
    }).format(amount)
}