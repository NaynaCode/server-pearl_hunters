const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserModel = require('./models/Users');

const app = express();
app.use(express.json());
app.use(cors());

const port = 3000;

// Connect to MongoDB
mongoose.connect("mongodb+srv://nadja:DojNDGDGsajuGrca@pearl-hunters.qeuam.mongodb.net/pearl-hunters?retryWrites=true&w=majority&appName=pearl-hunters");

// GET all users (for testing purposes)
app.get("/api/players", async (req, res) => {
    try {
        const users = await UserModel.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST to add a new user
app.post("/users/register", async (req, res) => {
    try {
        const { username } = req.body;

        // Check if the username already exists
        const existingUser = await UserModel.findOne({ username });

        if (existingUser) {
            // If the username exists, return a 400 error
            return res.status(400).json({ error: 'Username already taken' });
        }

        // If the username does not exist, create a new user
        const newUser = new UserModel({ username });
        await newUser.save();
        res.json({ message: `Welcome, ${username}!` });

    } catch (err) {
        // Handle server errors
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post("/users/login", async (req, res) => {
    try {
        const { username } = req.body;

        // Check if the username already exists
        const existingUser = await UserModel.findOne({ username });

        if (!existingUser) {
            const newUser = new UserModel({ username });
            await newUser.save();
            res.json({ message: "User added"})
        } else {
            res.json({ message: `Welcome, ${username}!` });
        }

        
        // If the username does not exist, create a new user
        

    } catch (err) {
        // Handle server errors
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port: ${port}...`);
});
