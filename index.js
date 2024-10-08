const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserModel = require('./models/Users');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_KEY || 'http://localhost:8080', 
        methods: ["GET", "POST"], 
    }
});

app.use(express.json());
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [process.env.CLIENT_KEY || 'http://localhost:8080'];
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

const port = 3000;

mongoose.connect(process.env.MONGO_KEY || "mongodb+srv://nadja:DojNDGDGsajuGrca@pearl-hunters.qeuam.mongodb.net/pearl-hunters?retryWrites=true&w=majority&appName=pearl-hunters");

let countdownTime = 60; 
let winner;
let intervalId;

function startCountdown() {
    intervalId = setInterval(async () => {
        if (countdownTime > 0) {
            countdownTime--;
            io.emit('timerUpdate', countdownTime);
        } else {
            clearInterval(intervalId);

            try {
                winner = await UserModel.findOne().sort({ coins: -1 }).exec();
                console.log(winner);
            
                if (winner) {
                    await UserModel.updateMany({}, { shells: 0, pearls: 0, necklaces: 0, coins: 0 });
                    console.log('All player values reset to zero.');
                } else {
                    console.log('No winner found.');
                }
            } catch (err) {
                console.error('Error during the process:', err);
            }
            
            console.log(winner);
            io.emit('resetAndChangeScene', winner);

            setTimeout(() => {
                countdownTime = 60;

                io.emit('timerUpdate', countdownTime);

                startCountdown();
            }, 5000);
        }
    }, 1000);
}

startCountdown();

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.emit('timerUpdate', countdownTime);

    socket.broadcast.emit('newPlayer', { id: socket.id });

    socket.on('playerMovement', (data) => {
        console.log('Player movement:', data);
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

            const users = await UserModel.find().sort({ coins: -1 });

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

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        socket.broadcast.emit('playerDisconnected', { id: socket.id });
    });
});

app.get("/api/players", async (req, res) => {
    try {
        const users = await UserModel.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/users/register", async (req, res) => {
    try {
        const { username } = req.body;

        const existingUser = await UserModel.findOne({ username });

        if (existingUser) {
            
            return res.status(400).json({ error: 'Username already taken' });
        }

        const newUser = new UserModel({ username });
        await newUser.save();
        res.json({ message: `Welcome, ${username}!` });

    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post("/users/login", async (req, res) => {
    try {
        const { username } = req.body;

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

server.listen(port, () => {
    console.log(`Server listening on port: ${port}...`);
});
