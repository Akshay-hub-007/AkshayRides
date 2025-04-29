"use server"

import { db } from "@/lib/prisma"

import {auth} from "@clerk/nextjs/server"
export default async function getAdmin() {
  
    const {userId}=await auth()

    if(!userId)  throw new  Error('Unauthroized')

    const user= await db.User.findUnique({
        where:{clerkUserId:userId}
    })
   console.log(user,)
   if(!user  || user.role!=="ADMIN")
    {
        return {authroized:false,reason:"not-admin"}
    }    

    return {authroized:true,user}
}
