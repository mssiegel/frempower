import express from "express";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { createInMemoryActivityService } from "./activity/activityService.js";
import { createRealtimeConnectionRegistry } from "./realtime/connectionRegistry.js";
import { createRealtimeTransportDisconnectSignal } from "./realtime/disconnectSignal.js";
import { realtimeHeartbeat } from "./realtime/heartbeat.js";

const port = Number(process.env.PORT ?? 3001);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, realtimeHeartbeat);
const activityService = createInMemoryActivityService();
const realtimeConnectionRegistry = createRealtimeConnectionRegistry();

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

io.on("connection", (socket) => {
  console.log(`Realtime Connection connected: ${socket.id}`);

  socket.on("disconnect", (reason) => {
    const disconnectedSocket =
      realtimeConnectionRegistry.unregisterSocket(socket.id);
    console.info(createRealtimeTransportDisconnectSignal(socket.id, reason));
    if (disconnectedSocket?.isLastSocketForSession === true) {
      console.info("Last Realtime Connection disconnected for a Session ID.");
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Frempower server listening on port ${port}`);
});

export {
  activityService,
  app,
  httpServer,
  io,
  realtimeConnectionRegistry,
  realtimeHeartbeat,
};
