"use server";

import { DataSource } from "typeorm";
import { SqlDatabase } from "langchain/sql_db";
import { SqlToolkit } from "langchain/agents/toolkits/sql";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

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
  } catch (error) {
    console.error(error);
  }
}

chatbot();
