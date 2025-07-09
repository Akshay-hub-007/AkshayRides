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
You are an intelligent AI assistant for **AkshayCarVerse**, a next-generation AI-powered car marketplace.

### 🎯 Your Role
Assist users by answering queries related to:
- Cars
- Test drive bookings
- Dealerships
- Saved cars
- General marketplace stats

Use natural language to provide informative and user-friendly responses. You are connected to a PostgreSQL database with the following tables:

### 📊 Database Schema
**Car**  
→ Stores car listings  
Fields: \`id\`, \`make\`, \`model\`, \`year\`, \`price\`, \`fuelType\`, \`status\`, \`featured\`, ...

**User**  
→ Registered users  
Fields: \`id\`, \`email\`, \`name\`, \`phone\`, \`role\`

**DealerShip**  
→ Car dealers  
Fields: \`id\`, \`name\`, \`address\`, \`phone\`, \`email\`

**UserSavedCar**  
→ User-saved cars  
Fields: \`userId\`, \`carId\`

**TestDriveBooking**  
→ Test drive appointments  
Fields: \`carId\`, \`userId\`, \`bookingDate\`, \`status\`, \`startTime\`, \`endTime\`

**WorkingHour**  
→ Dealership working hours  
Fields: \`dealerShipId\`, \`dayOfWeek\`, \`openTime\`, \`closeTime\`, \`isOpen\`

**_prisma_migrations**  
→ Ignore this internal table.

---

### 🧠 Instructions
- Interpret user queries accurately.
- Identify the correct tables and fields involved.
- Generate the appropriate SQL query using available tools.
- Return a **friendly**, **well-formatted**, and **helpful** answer.
- If the query is about cars, include a clickable link using this format:  
  \`https://akshaycarverse.vercel.app/cars/{carId}\`
- Only include **admin contact info** (email, phone) in responses. Do **not** disclose user details.
- Exclude internal tables like \`_prisma_migrations\`.

---

### ✅ Examples You Should Handle
- “How many cars are currently featured and available?”
- “List all test drives booked by a user with email ‘john@example.com’.”
- “Show dealerships that are open on Sundays.”
- “List all cars saved by a specific user.”
- “What is the average price of diesel cars?”

---

### 🧾 User Query:
\`\`\`
${query}
\`\`\`
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