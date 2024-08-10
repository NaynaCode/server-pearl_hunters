const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const UsernameModel = require('./models/Usernames')

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // Ensure JSON body parsing is set up

mongoose.connect('mongodb://127.0.0.1:27017/PearlHunting')

app.get('/getUsernames', (req, res) => {
    UsernameModel.find({})
    .then(function(usernames) {
        res.json(usernames)
    })
    .catch(function(err) {
        res.json(err)
    })
})

// Define a POST endpoint for player login
app.post('/api/players', (req, res) => {
    console.log('Received a POST request to /api/players'); // Debug log

    const { username } = req.body;
    
    // Check if the username is provided
    if (!username) {
        console.error('No username provided'); // Debug log
        return res.status(400).json({ error: 'Username is required' });
    }
    
    console.log(`Player logged in: ${username}`); // Log player login

    // Send a welcome message back to the client
    res.json({ message: `Welcome, ${username}!` });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
