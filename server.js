import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const port = 10000;
const app = express();
const server = createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    connectionStateRecovery: {},
  },
});

let globalContent,
  globalHost,
  globalId,
  globalClassName = [];

io.on("connection", (socket) => {
  console.log("Connected");

  socket.on("user-create", (data) => {
    const { className, host, id } = data;
    globalClassName.push(id);
    console.log(globalClassName);
    socket.join(id);
    socket.emit("host", { host, id, className });
  });

  socket.on("user-joined", (data) => {
    const { id, host } = data;

    if (!globalClassName.includes(id)) {
      socket.emit("inactive-class", { success: true });
    }
    socket.join(id);
    socket.emit("host", { host });

    if (!host) {
      socket.broadcast.to(id).emit("user-joined", { success: true });
    }
    // socket.emit("canvas-response", globalContent);
  });

  // socket.on("canvas-data", (data) => {
  //   globalContent = data;
  //   console.log(data);
  //   socket.broadcast.to(globalClassName).emit("canvas-response", data);
  // });

  socket.on("disconnect", () => {
    console.log("Disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("MathCollab server active");
});

server.listen(port, () =>
  console.log(`server is running on http://localhost:${port}`)
);
