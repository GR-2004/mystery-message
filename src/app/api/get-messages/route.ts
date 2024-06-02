import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request){
    await dbConnect();
    const session = await getServerSession(authOptions)
    if(!session || !session.user){
        return Response.json(
            {
                success: false,
                message: "Not Authenticated"
            },
            {status: 401}
        )
    }
    const user: User = session.user as User
    //so when we have to write some aggregation, then we have to convert this user.id string to mongoose object, In other cases we can use directly it for simple operation like findbyid, findandupdate etc.
    const userId = new mongoose.Types.ObjectId(user._id);
    try {
        const user = await UserModel.aggregate([
            {
                $match : {id: userId}
            },
            {
                $unwind: '$messages'
            },
            {
                $sort: {'messages.createdAt': -1}
            },
            {
                $group: {_id: '$_id', messages: {$push: '$messages'}}
            }
        ])
        if(!user || user.length === 0){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {status: 404}
            )
        }
        return Response.json(
            {
                success: true,
                message: user[0].messages
            },
            {status: 200}
        )
    } catch (error) {
        console.log("error adding messages", error)
        return Response.json(
            {
                success: true,
                message: "Internal server error"
            },
            {status: 500}
        )
    }
}