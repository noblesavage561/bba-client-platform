import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

function getOAuthClient(): OAuth2Client {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  // In production, set credentials via client.setCredentials({ access_token, refresh_token })
  // retrieved from the user's OAuth flow or service account credentials
  return client;
}

export async function createClientFolder(
  businessName: string,
  parentFolderId?: string
): Promise<string> {
  const auth = getOAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const folderName = `BBA - ${businessName} - ${new Date().getFullYear()}`;
  const parent = parentFolderId ?? process.env.GOOGLE_DRIVE_FOLDER_ID;

  const res = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: parent ? [parent] : undefined,
    },
    fields: "id",
  });

  if (!res.data.id) {
    throw new Error("Failed to create Google Drive folder");
  }

  return res.data.id;
}

export async function uploadFileToDrive(
  folderId: string,
  filename: string,
  mimeType: string,
  buffer: Buffer
): Promise<string> {
  const auth = getOAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const { Readable } = await import("stream");
  const stream = Readable.from(buffer);

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: "id, webViewLink",
  });

  return res.data.webViewLink ?? res.data.id ?? "";
}

export async function getOrCreateSubfolder(
  parentFolderId: string,
  subfolderName: string
): Promise<string> {
  const auth = getOAuthClient();
  const drive = google.drive({ version: "v3", auth });

  // Check if subfolder already exists
  const existing = await drive.files.list({
    q: `name='${subfolderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  });

  if (existing.data.files && existing.data.files.length > 0) {
    return existing.data.files[0].id!;
  }

  // Create it
  const res = await drive.files.create({
    requestBody: {
      name: subfolderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id",
  });

  return res.data.id!;
}
