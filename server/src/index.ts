import express from "express";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";

const port = Number(process.env.PORT ?? 3001);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

io.on("connection", (socket) => {
  console.log(`Realtime Connection connected: ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`Realtime Connection disconnected: ${socket.id} (${reason})`);
  });
});

httpServer.listen(port, () => {
  console.log(`Frempower server listening on port ${port}`);
});

export { app, httpServer, io };
