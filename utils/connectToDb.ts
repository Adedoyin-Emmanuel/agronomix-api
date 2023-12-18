const mongoose = require("mongoose");

async function connectDB() {
  const dbUrl: any = process.env.MONGODB_URL;
  mongoose
    .connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error: any) => {
      console.log("MongoDb Failed to connect:", error);
    });
}

export default connectDB;
