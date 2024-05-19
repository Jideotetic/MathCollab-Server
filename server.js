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

let classes;
let globalTexts = [];
let globalContent = "";

io.on("connection", (socket) => {
  console.log("Connected");

  socket.on("send-classes", (classes) => {
    classes = classes;
    console.log(classes);
    socket.emit("initial-text", globalTexts);
  });

  socket.on("like", (data) => {
    socket.broadcast.emit("liked", data);
  });

  socket.on("register", (data) => {
    socket.broadcast.emit("registered", data);
  });

  socket.on("start-class", (id) => {
    socket.join(id);
    socket.broadcast.emit("start-class", id);
    setTimeout(() => {
      socket.emit("class-started", { success: true, host: true });
    }, 100);
  });

  socket.on("end-class", () => {
    socket.broadcast.emit("start-class", "");
  });

  // socket.on("send-classes", (classes) => {
  //   globalClasses = classes;
  //   console.log(globalClasses);
  //   socket.emit("initial-text", globalTexts);
  // });

  // socket.on("join-class", (data) => {
  //   const { id, user } = data;
  //   socket.join(id);
  //   const lesson = globalClasses.filter((item) => item.id === id);
  //   if (lesson[0].status === "upcoming") {
  //     socket.emit("failed-join", { success: false });
  //   }

  //   if (lesson[0].status === "ongoing") {
  //     socket.emit("joined-successfully", { success: true, host: false });
  //     socket.broadcast.emit("joined", { success: true, user });
  //   }
  // });

  // socket.on("content", (content) => {
  //   globalContent = content;
  //   socket.broadcast.emit("content-data", content);
  // });

  // socket.on("text", (text) => {
  //   globalTexts.push(text);
  //   setTimeout(() => {
  //     io.emit("text", globalTexts);
  //   }, 100);
  // });

  // socket.emit("content-data", globalContent);

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
