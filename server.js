require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const fs = require("fs");

// Initialize Firebase Admin SDK
const serviceAccount = require("./firebaseConfig.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://wishlistapp-b57b7.firebaseio.com"
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

// User Registration
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });
    res.status(201).json({ message: "User created successfully", uid: userRecord.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().getUserByEmail(email);
    res.status(200).json({ message: "Login successful", uid: user.uid });
  } catch (error) {
    res.status(400).json({ error: "Invalid credentials" });
  }
});

// Create Gift Registry
app.post("/create-registry", async (req, res) => {
  const { userId, title } = req.body;
  try {
    const registryRef = db.collection("registries").add({
      userId,
      title,
      gifts: [],
      createdAt: new Date(),
    });
    res.status(201).json({ message: "Registry created", id: (await registryRef).id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
