"use server";

import { DataSource } from "typeorm";
import { SqlDatabase } from "langchain/sql_db";
import { SqlToolkit } from "langchain/agents/toolkits/sql";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

export async function chatbot() {
    try {
        console.log("hi");

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

        console.log(
            tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
            }))
        );
 const exampleQuery = "can you give the information about the admins in user table";

        const agentExecutor = createReactAgent({ llm, tools });

        const events = await agentExecutor.stream(
            { messages: [["user", exampleQuery]] },
            { streamMode: "values" }
        );

        for await (const event of events) {
            const lastMsg = event.messages[event.messages.length - 1];
            if (lastMsg.tool_calls?.length) {
                console.dir(lastMsg.tool_calls, { depth: null });
            } else if (lastMsg.content) {
                console.log(lastMsg.content);
            }
        }

    } catch (error) {
        console.error(error);
    }
}

chatbot();
