// app/api/upload/route.ts

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import formidable, { Files, Fields } from "formidable";
import fs from "fs";
import { Readable } from "stream";
import { IncomingMessage } from "http";


export const config = {
  api: {
    bodyParser: false,
  },
};

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

function requestToIncomingMessage(req: Request): IncomingMessage {
  const readable = Readable.fromWeb(req.body as any) as unknown as IncomingMessage;
  readable.headers = Object.fromEntries(req.headers.entries());
  return readable;
}

async function readFileFromRequest(req: IncomingMessage): Promise<{ file: any }> {
  const form = formidable({ keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err: Error | null, _fields: Fields, files: Files) => {
      if (err) return reject(err);
      const uploadedFile = files.file;
      if (!uploadedFile) return reject(new Error("No file uploaded"));
      const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
      resolve({ file });
    });
  });
}

export async function POST(req: Request) {
  const nodeReq = requestToIncomingMessage(req);
  const { file } = await readFileFromRequest(nodeReq);
  const fileStream = fs.createReadStream(file.filepath);
  const fileName = `users/${Date.now()}-${file.originalFilename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    Body: fileStream,
    ContentType: file.mimetype,
  });

  await s3.send(command);

  return NextResponse.json({
    message: "Uploaded successfully!",
    key: fileName,
    url: `/api/image?key=${encodeURIComponent(fileName)}`,
  });
}
