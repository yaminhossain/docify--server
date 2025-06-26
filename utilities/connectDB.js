const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.9azss.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const collectionNames = {
  USERS: "users",
  DOCUMENTS: "documents",
};

// Function to get a MongoDB collection
function connectDB(collectionName) {
  return client.db(process.env.DATABASE_NAME).collection(collectionName);
}

module.exports = {
  connectDB,
  collectionNames,
  client,
};
