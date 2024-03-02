import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let globalContent, globalClassName, globalHost;

io.on("connection", (socket) => {
  console.log("Connected");

  // socket.on("class-created", (data) => {
  //   const { className } = data;
  //   globalClassName = className;
  //   socket.join(className);
  //   socket.emit("class-created", { success: true, className });
  //   socket.broadcast.to(className).emit("canvas-data-response", {
  //     content: globalContent,
  //   });
  // });

  socket.on("user-joined", (data) => {
    const { className } = data;
    globalClassName = className;
    socket.join(className);
    socket.broadcast.emit("user-joined", { success: true });
    socket.broadcast.to(className).emit("canvas-data-response", globalContent);
  });

  socket.on("host", (data) => {
    const { host } = data;
    globalHost = host;
    socket.emit("host", { host });
  });

  socket.on("canvas-data", (data) => {
    globalContent = data;
    socket.broadcast.to(globalClassName).emit("canvas-data-response", data);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected");
    socket.to(globalClassName).emit("host", { globalHost });
  });
});

server.listen(port, () =>
  console.log(`server is running on http://localhost:${port}`)
);

app.get("/", (req, res) => {
  res.send("MathCollab server");
});
