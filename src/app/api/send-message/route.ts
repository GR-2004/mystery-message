import UserModel from "@/models/user.model";
import dbConnect from "@/lib/dbConnect";
import { Message } from "@/models/user.model";

export async function POST(request: Request){
    await dbConnect()
    const {username, content} = await request.json();
    try {
        const user = await UserModel.findOne({username});
        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {status: 404}
            )
        }
        //is user accepting the message
        if(!user.isAcceptingMessage){
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting the messages"
                },
                {status: 401}
            )
        }
        const newMessage =  {content, createdAt: new Date()}
        user.messages.push(newMessage as Message)
        await user.save()
        return Response.json(
            {
                success: true,
                message: "message sent successfully"
            },
            {status: 200}
        )
    } catch (error) {
        console.log("an unexpected error occured: ", error)
        return Response.json(
            {
                success: false,
                message: "User is not able to send messages"
            },
            {status: 500}
        )
    }
}