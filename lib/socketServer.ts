// lib/socketServer.ts
import { Server as IOServer } from "socket.io";
import type { NextApiResponse, NextApiRequest } from "next";

let ioGlobal: IOServer | undefined;

/* คืน instance (สร้างถ้ายังไม่มี) */
export const getIO = (res?: NextApiResponse): IOServer | undefined => {
  if (!ioGlobal && res) {
    const httpServer: any = (res.socket as any).server;

    ioGlobal = new IOServer(httpServer, {
      path: "/api/socketio",
      addTrailingSlash: false,
    });

    /* ───────── event handler ───────── */
    ioGlobal.on("connection", (socket) => {
      console.log("🟢 connect", socket.id);

      socket.on("join", (room) => {
        socket.join(room);
        console.log("🚪 join", socket.id, room);
      });

      socket.on("client_new_message", (msg) => {
        console.log("⏩ client_new_message", socket.id, msg.text);
        ioGlobal?.to(msg.conversationId.toString()).emit("new_message", msg);
      });
    });
  }
  return ioGlobal;
};

/* Next.js API config */
export const config = { api: { bodyParser: false } };

/* /api/socketio route */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  getIO(res); // bootstrap ครั้งแรก
  res.end();
}
