// pages/api/socketio.ts
import { Server as IOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";

let ioGlobal: IOServer | undefined;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  /* ── cast res.socket เป็น any แล้วดึง .server ── */
  const httpServer: HTTPServer = (res.socket as any).server;

  if (!ioGlobal) {
    ioGlobal = new IOServer(httpServer, {
      path: "/api/socketio",
      addTrailingSlash: false,
    });

    ioGlobal.on("connection", (socket) => {
      console.log("🟢 connect", socket.id);

      socket.on("join", (roomId: string) => {
        socket.join(roomId);
        console.log("🚪 join", socket.id, roomId);
      });

      socket.on("client_new_message", (msg) => {
        console.log("⏩ client_new_message", socket.id, msg.text);
        ioGlobal!.to(msg.conversationId.toString()).emit("new_message", msg);
      });
    });
  }

  res.end(); // จบ request
}
