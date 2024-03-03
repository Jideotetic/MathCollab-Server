import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const port = 10000;
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

  socket.on("user-create", (data) => {
    const { className, user, host } = data;
    globalClassName = className;
    socket.join(className);
    console.log(className, globalClassName);
    socket.emit("host", host);
    // socket.emit("class-name", globalClassName);
    // socket.broadcast.to(className).emit("user-joined", { success: true });
    // socket.emit("canvas-data-response", globalContent);
  });

  socket.on("user-joined", (data) => {
    const { className, user, host } = data;
    // socket.join(className);
    socket.emit("host", host);
    console.log(className, globalClassName);

    if (globalClassName !== className) {
      socket.emit("inactive-class", { success: true });
    }

    // socket.emit("class-name-joined", className);
    // socket.broadcast.to(className).emit("user-joined", { success: true });
    // socket.emit("canvas-data-response", globalContent);
  });

  // socket.on("host", (data) => {
  //   const { host } = data;
  //   globalHost = host;
  //   socket.emit("host", { host });
  // });

  socket.on("canvas-data", (data) => {
    globalContent = data;
    socket.broadcast.to(globalClassName).emit("canvas-data-response", data);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected");
  });
});

server.listen(port, () =>
  console.log(`server is running on http://localhost:${port}`)
);

app.get("/", (req, res) => {
  res.send("MathCollab server");
});
