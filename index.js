const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserModel = require('./models/Users');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Updated CORS configuration for Socket.IO
const io = new Server(server);

app.use(express.json());
app.use(cors({
    origin: 'https://pearl-hunters-client.vercel.app/', // Allow requests from this origin
    methods: ["GET", "POST"], // Specify which methods are allowed
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true // Allow cookies to be sent
}));

const port = 3000;

// Connect to MongoDB
mongoose.connect("mongodb+srv://nadja:DojNDGDGsajuGrca@pearl-hunters.qeuam.mongodb.net/pearl-hunters?retryWrites=true&w=majority&appName=pearl-hunters");

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle player movement
    socket.on('playerMovement', (data) => {
        console.log('Player movement:', data);
        // Broadcast the player's movement to other clients
        socket.broadcast.emit('playerMovement', { id: socket.id, ...data });
    });

    socket.on('updateShells', async (data) => {
        const {username, shells} = data;
        if (!username) {
            console.error('Username not provided');
            return;
        }
        try {
            const user = await UserModel.findOne({ username });
            if (user) {
                user.shells = shells;
                await user.save();
                console.log('Shells updated');
            } else {
                console.error('User not found');
            }
        } catch (err) {
            console.error('Error updating shells: ', err);
        }
    });

    socket.on('updatePearls', async (data) => {
        const {username, shells, pearls} = data;
        if (!username) {
            console.error('Username not provided');
            return;
        }
        try {
            const user = await UserModel.findOne({ username });
            if (user) {
                user.shells = shells;
                user.pearls = pearls;
                await user.save();
                console.log('Pearls updated');
            } else {
                console.error('User not found');
            }
        } catch (err) {
            console.error('Error updating pearls: ', err);
        }
    });

    socket.on('updateNecklaces', async (data) => {
        const {username, pearls, necklaces} = data;
        if (!username) {
            console.error('Username not provided');
            return;
        }
        try {
            const user = await UserModel.findOne({ username });
            if (user) {
                user.pearls = pearls;
                user.necklaces = necklaces;
                await user.save();
                console.log('Necklaces updated');
            } else {
                console.error('User not found');
            }
        } catch (err) {
            console.error('Error updating necklaces: ', err);
        }
    });

    socket.on('updateCoins', async (data) => {
        try {
            const { username, necklaces, coins } = data;
            await UserModel.findOneAndUpdate({ username }, { necklaces, coins });

            // Fetch the updated leaderboard
            const users = await UserModel.find().sort({ coins: -1 });

            // Emit the updated leaderboard to all connected clients
            io.emit('leaderboardData', { users });
        } catch (err) {
            console.error('Error updating coins:', err);
        }
    });

    socket.on('requestLeaderboard', async () => {
        try {
            const users = await UserModel.find().sort({ coins: -1 });
            if (users) {
                socket.emit('leaderboardData', { users });
            } else {
                socket.emit('leaderboardData', { error: 'No users found' });
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
            socket.emit('leaderboardData', { error: 'Server error' });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Optionally broadcast disconnection to other clients
        socket.broadcast.emit('playerDisconnected', { id: socket.id });
    });
});

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
            existingUser.timestamp = new Date();
            await existingUser.save();
            res.json({ message: `Welcome, ${username}!` });
        }
    } catch (err) {
        // Handle server errors
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post("/userData", async (req, res) => {
    try {
        const { username } = req.body;
        const user = await UserModel.findOne({ username });
        if (user) {
            res.json({ user });
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).send('Server error');
    }
});



// Start the server
server.listen(port, () => {
    console.log(`Server listening on port: ${port}...`);
});
