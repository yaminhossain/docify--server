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
    origin: ["http://localhost:3000", "https://docify-one.vercel.app"],
  },
});

app.get("/", (req, res) => {
  res.send("Docify server is running");
});

async function run() {
  try {
    // ========Express APIs============
    app.post("/documents", async (req, res) => {
      const collection = connectDB(collectionNames.DOCUMENTS);
      const result = await collection.insertOne(req.body);
      res.send(result);
    });

    // ================Socket.io socket connection============
    io.on("connection", (socket) => {
      console.log("User connected to the socket");
      socket.on("get-document", async (documentId) => {
        const document = await findMatchedDocument(documentId);
        socket.join(documentId);
        socket.emit("load-document", document.data);
        socket.on("send-changes", (delta) => {
          socket.broadcast.to(documentId).emit("receive-changes", delta);
        });
        socket.on("save-document", async (data) => {
          const documentCollection = connectDB(collectionNames.DOCUMENTS);
          const filter = { documentId };
          const options = { upsert: true };
          const updateDoc = {
            $set: {
              data,
            },
          };
          const result = await documentCollection.updateOne(
            filter,
            updateDoc,
            options
          );
          console.log("Result after updating the doc", result);
        });
      });
    });

    const findMatchedDocument = async (id) => {
      if (id === null) return;
      const documentCollection = connectDB(collectionNames.DOCUMENTS);
      const document = await documentCollection.findOne({ documentId: id });
      if (document) {
        return document;
      }
      return;
    };
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
