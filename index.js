const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const UserModel = require('./models/Users')

const app = express();
app.use(express.json());


app.use(cors());



const port = 3000;

mongoose.connect("mongodb+srv://nadja:DojNDGDGsajuGrca@pearl-hunters.qeuam.mongodb.net/pearl-hunters?retryWrites=true&w=majority&appName=pearl-hunters");

app.get("/getUsers", (req, res) => {
    UserModel.find({})
    .then(function(users) {
        console.log(users);
        res.json(users)
    }).catch(function(err) {
        res.json(err)
    })
})

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

app.listen(port, () => {
    console.log(`Server listening on port: ${port}...`);
})