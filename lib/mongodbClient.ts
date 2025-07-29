// lib/mongodbClient.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
export const clientPromise = client.connect();
