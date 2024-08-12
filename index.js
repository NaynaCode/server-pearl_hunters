const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserModel = require('./models/Users');

const app = express();
app.use(express.json());

const corsOptions = {
    origin: 'https://pearl-hunters-client.vercel.app',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

const port = 3000;

mongoose.connect("mongodb+srv://nadja:DojNDGDGsajuGrca@pearl-hunters.qeuam.mongodb.net/pearl-hunters?retryWrites=true&w=majority&appName=pearl-hunters");

app.get("/api/players", async (req, res) => {
    try {
        const users = await UserModel.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/players", async (req, res) => {
    try {
        const user = req.body;
        const newUser = new UserModel(user);
        await newUser.save();
        res.json({ message: `Welcome, ${user.username}!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port: ${port}...`);
});
