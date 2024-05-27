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

io.on("connection", (socket) => {
  console.log("Connected");

  socket.on("class-created", () => {
    socket.broadcast.emit("class-created-successfully");
  });

  socket.on("like", () => {
    socket.broadcast.emit("like-successfully");
  });

  socket.on("register", (data) => {
    socket.broadcast.emit("register-successfully", data);
  });

  socket.on("start-class", (id) => {
    socket.join(id);
    console.log(id);
    socket.broadcast.emit("start-class-successfully");
    setTimeout(() => {
      socket.emit("class-started", { success: true, host: true });
    }, 500);
  });

  socket.on("stopped-class", () => {
    socket.broadcast.emit("stopped-class-successfully");
  });

  // socket.on("join-class", (data) => {
  //   const { id, user } = data;
  //   socket.join(id);
  //   console.log(id);

  //   socket.emit("joined-successfully", { success: true, host: false });
  //   socket.broadcast.emit("joined", { success: true, user });
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
