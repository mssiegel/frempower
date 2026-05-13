import express from "express";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";

const port = Number(process.env.PORT ?? 3001);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

httpServer.listen(port, () => {
  console.log(`Frempower server listening on port ${port}`);
});

export { app, httpServer, io };
