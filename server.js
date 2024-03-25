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

io.on("connection", (socket) => {
  console.log("Connected");

  socket.on("connected", (lessons) => {
    console.log("connected", globalClassName);
    globalClassName = lessons;
    socket.emit("connected-successfully", { success: true });
  });

  socket.on("start-class", (id) => {
    setTimeout(() => {
      socket.emit("class-started", { success: true });
    }, 100);
  });

  socket.on("join-class", (data) => {
    const { id, user } = data;
    console.log(id, user);
    const lesson = globalClassName.filter((item) => item.id === id);
    console.log(lesson);
    if (lesson[0].status === "created") {
      console.log("created");
      // setTimeout(() => {
      socket.emit("failed-join", { success: false });
      // }, 1000);
    }

    if (lesson[0].status === "ongoing") {
      console.log("ongoing");
      // setTimeout(() => {
      socket.emit("joined-successfully", { success: true });
      socket.broadcast.emit("joined", { success: true, user });
      // }, 1000);
    }
  });

  // console.log(globalClassName);

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
