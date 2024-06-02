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
  },
});

const classesContent = {};

io.on("connection", (socket) => {
  console.log("Connected");

  socket.on("class-created", () => {
    socket.broadcast.emit("class-created-successfully");
    setTimeout(() => {
      socket.emit("class-created");
    }, 1000);
  });

  socket.on("like", () => {
    socket.broadcast.emit("like-successfully");
  });

  socket.on("register", (data) => {
    socket.broadcast.emit("register-successfully", data);
  });

  socket.on("start-class", (id) => {
    socket.join(id);
    classesContent[id] = [];
    socket.broadcast.emit("start-class-successfully");
    setTimeout(() => {
      socket.emit("class-started");
    }, 1000);

    console.log(classesContent);
  });

  socket.on("stopped-class", () => {
    socket.broadcast.emit("stopped-class-successfully");
    socket.emit("stopped-class-successfully");
  });

  socket.on("join-class", (data) => {
    const { id, user } = data;
    socket.join(id);
    const newContent = classesContent[id];
    setTimeout(() => {
      socket.emit("joined-successfully", { user });
      socket.emit("receive-initial-text", newContent);
      socket.broadcast.to(id).emit("joined", { user });
    }, 1000);
    console.log(classesContent[id]);
  });

  socket.on("rejoined-class", (id) => {
    socket.join(id);
    const newContent = classesContent[id];
    socket.emit("receive-initial-text", newContent);
    // if (classesContent[id]) {
    //   classesContent[id] = classesContent[id];
    //   socket.emit("receive-initial-text", newContent);
    // } else {
    //   classesContent[id] = [];
    // }
  });

  socket.on("send-text", (data) => {
    const { newContent, id } = data;
    socket.join("id");
    classesContent[id] = [...newContent];
    socket.broadcast.to(id).emit("receive-text", newContent);
    console.log(classesContent);
  });

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
