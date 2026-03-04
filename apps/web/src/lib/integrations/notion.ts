import { Client as NotionClient } from "@notionhq/client";

let notionClient: NotionClient | null = null;

function getNotionClient(): NotionClient {
  if (!notionClient) {
    if (!process.env.NOTION_TOKEN) {
      throw new Error("NOTION_TOKEN environment variable is not set");
    }
    notionClient = new NotionClient({ auth: process.env.NOTION_TOKEN });
  }
  return notionClient;
}

export interface NotionClientRecord {
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  stage: string;
  programTrack?: string;
  readinessScore: number;
}

export async function createNotionClientRecord(
  databaseId: string,
  record: NotionClientRecord
): Promise<string> {
  const notion = getNotionClient();

  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: [{ text: { content: record.businessName } }],
      },
      "Owner Name": {
        rich_text: [{ text: { content: record.ownerName } }],
      },
      "Owner Email": {
        email: record.ownerEmail,
      },
      Stage: {
        select: { name: record.stage },
      },
      "Program Track": {
        rich_text: record.programTrack
          ? [{ text: { content: record.programTrack } }]
          : [],
      },
      "Readiness Score": {
        number: record.readinessScore,
      },
    },
  });

  return response.id;
}

export async function updateNotionClientStage(
  pageId: string,
  stage: string
): Promise<void> {
  const notion = getNotionClient();

  await notion.pages.update({
    page_id: pageId,
    properties: {
      Stage: {
        select: { name: stage },
      },
    },
  });
}

export async function queryNotionDatabase(
  databaseId: string,
  filter?: Parameters<NotionClient["databases"]["query"]>[0]["filter"]
) {
  const notion = getNotionClient();

  const response = await notion.databases.query({
    database_id: databaseId,
    filter,
  });

  return response.results;
}
