const express = require("express");
const app = express();
const http = require("http");
const httpServer = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const { connectDB, collectionNames } = require("./utilities/connectDB");

// ===========Port===========
const port = process.env.PORT || 5000;

// =========Middlewares=======
app.use(cors());
app.use(express.json());

// ==========Socket.io initialization===========
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.get("/", (req, res) => {
  res.send("Docify server is running");
});

async function run() {
  try {
    // ========Express APIs============
    app.post("/documents", async (req, res) => {
      console.log(req.body);
      const collection = connectDB(collectionNames.DOCUMENTS);
      const result = await collection.insertOne(req.body);
      res.send(result);
    });

    // ================Socket.io socket connection============
    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      socket.on("send-changes", (data) => {
        console.log("Received changes:", data);
      });
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// ==================HTTP SERVER IS LISTENING==================
httpServer.listen(port, () => {
  console.log(`Document server is running at ${port}`);
});
