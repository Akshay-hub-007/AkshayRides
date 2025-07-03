"use server";

import { DataSource } from "typeorm";
import { SqlDatabase } from "langchain/sql_db";
import { SqlToolkit } from "langchain/agents/toolkits/sql";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

export async function chatbot(query) {
    try {

        console.log(query);

        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash",
            temperature: 0,
        });

        const datasource = new DataSource({
            type: "postgres",
            url: "postgresql://postgres.pirvptrbtslylxkjuvoa:!kshay2006M@r@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
            ssl: { rejectUnauthorized: false },
        });

        const db = await SqlDatabase.fromDataSourceParams({
            appDataSource: datasource,
        });

        console.log("connected");

        const toolkit = new SqlToolkit(db, llm);

        const tools = toolkit.getTools();

        // console.log(
        //     tools.map((tool) => ({
        //         name: tool.name,
        //         description: tool.description,
        //     }))
        // );
        // Improved prompt: Ask for all users with the admin role, and show their names and emails if available
        const exampleQuery = `
You are an intelligent AI assistant for **AkshayCarVerse**, a next-gen AI-powered car marketplace.

You are connected to a PostgreSQL database with the following key tables:

- **Car**: Stores details about cars (id, make, model, year, price, fuelType, status, featured, etc.)
- **User**: Stores user profiles (id, email, name, phone, role)
- **DealerShip**: Information about dealers (id, name, address, phone, email)
- **UserSavedCar**: Mapping of saved cars for users (userId, carId)
- **TestDriveBooking**: Test drive bookings by users (carId, userId, bookingDate, status, startTime, endTime)
- **WorkingHour**: Working hours for each dealership (dealerShipId, dayOfWeek, openTime, closeTime, isOpen)
- **_prisma_migrations**: Internal table for schema migrations (ignore this in queries)

Your task:
- Understand user queries related to cars, bookings, users, or dealers.
- Identify the correct tables and fields.
- Generate the appropriate SQL using available tools.
- Provide a clear and helpful response in natural language.

Examples you should handle:
- “How many cars are currently featured and available?”
- “List all test drives booked by a user with email ‘john@example.com’.”
- “Show dealerships that are open on Sundays.”
- “List all cars saved by a specific user.”
- “What is the average price of diesel cars?”

Be smart, and avoid referencing irrelevant tables like _prisma_migrations.

NOTE:Formt the final reponse in a clear and good way and should be more informative.

**User query:**  
"${query}"
`;

        const agentExecutor = createReactAgent({ llm, tools });

        const events = await agentExecutor.stream(
            { messages: [["user", exampleQuery]] },
            { streamMode: "values" }
        );
       let message;
        for await (const event of events) {
            const lastMsg = event.messages[event.messages.length - 1];
            if (lastMsg.tool_calls?.length) {
                console.dir(lastMsg.tool_calls, { depth: null });
            } else if (lastMsg.content) {
                // console.log("final result:",lastMsg.content);
                message=lastMsg.content
            }
        }

        // console.log("message:",message)
      return message
    } catch (error) {
        console.error(error);
    }
}