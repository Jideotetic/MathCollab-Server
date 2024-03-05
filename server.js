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

  // socket.on("user-create", (data) => {
  //   const { className, user, host } = data;
  //   globalClassName = className;
  //   console.log(globalClassName, className, globalContent);
  //   socket.join(className);
  //   socket.emit("host", host);
  //   // io.in(className).emit("canvas-response", globalContent);
  // });

  socket.on("user-joined", (data) => {
    const { className, user, host } = data;
    if (host) {
      globalClassName = className;
    }
    if (globalClassName !== className) {
      socket.emit("inactive-class", { success: true });
    }
    socket.join(className);
    socket.emit("host", host);
    console.log(globalClassName, className, globalContent);

    if (!host) {
      socket.broadcast.to(className).emit("user-joined", { success: true });
    }
    socket.broadcast.to(className).emit("canvas-response", globalContent);
  });

  socket.on("canvas-data", (data) => {
    globalContent = data;
    console.log(data);
    socket.broadcast.to(globalClassName).emit("canvas-response", data);
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
