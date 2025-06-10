import express from "express";
import mongoose from "mongoose";
import cors from "cors";
const app = express();

// Middleware
app.use(express.json()); // Replacing body-parser

app.use(cors());

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/MyDatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Define Schema and Model for `user_messages`
const userMessageSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // User ID associated with the message
  message: { type: String, required: true }, // Actual message content
});

const UserMessage = mongoose.model("user_messages", userMessageSchema); // Explicit collection name

// Routes

// 1. Create a new user message
app.post("/api/user_messages", async (req, res) => {
  try {
    const userMessage = new UserMessage(req.body);
    const savedMessage = await userMessage.save();
    res.status(201).send(savedMessage);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// 2. Get all user messages
app.get("/api/user_messages", async (req, res) => {
  try {
    const messages = await UserMessage.find();
    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 3. Get a single user message by ID
app.get("/api/user_messages/:id", async (req, res) => {
  try {
    const message = await UserMessage.findById(req.params.id);
    if (!message) return res.status(404).send({ error: "Message not found" });
    res.status(200).send(message);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 4. Update a user message by ID
app.put("/api/user_messages/:id", async (req, res) => {
  try {
    const message = await UserMessage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!message) return res.status(404).send({ error: "Message not found" });
    res.status(200).send(message);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// 5. Delete a user message by ID
app.delete("/api/user_messages/:id", async (req, res) => {
  try {
    const message = await UserMessage.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).send({ error: "Message not found" });
    res.status(200).send({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Enable CORS (for frontend API calls)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Start the Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
