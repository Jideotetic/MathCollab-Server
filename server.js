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

let globalClassName = [];
let globalContent = "";

io.on("connection", (socket) => {
  console.log("Connected");

  socket.on("connected", (lessons) => {
    console.log("connected", globalClassName);
    globalClassName = lessons;
    socket.emit("connected-successfully", { success: true });
  });

  socket.on("start-class", (id) => {
    socket.join(id);
    setTimeout(() => {
      socket.emit("class-started", { success: true });
    }, 100);
  });

  socket.on("join-class", (data) => {
    const { id, user } = data;
    socket.join(id);
    const lesson = globalClassName.filter((item) => item.id === id);
    if (lesson[0].status === "created") {
      socket.emit("failed-join", { success: false });
    }

    if (lesson[0].status === "ongoing") {
      socket.emit("joined-successfully", { success: true });
      socket.broadcast.emit("joined", { success: true, user });
    }
  });

  socket.on("content", (content) => {
    console.log(content);
    globalContent = content;
    socket.broadcast.emit("content-data", content);
  });

  console.log(globalContent);

  io.emit("content-data", globalContent);

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
