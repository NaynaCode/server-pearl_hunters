const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const UserModel = require('./models/Users')

const app = express();
app.use(cors({
    origin: ["https://pearl-hunters-client.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    optionsSuccessStatus: 200,
    credentials: true
}));
app.use(express.json());

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

app.post("/addUser", async (req, res) => {
    const user = req.body;
    const newUser = new UserModel(user);
    await newUser.save();
    console.log(user)
    res.json(user);
})

app.listen(port, () => {
    console.log(`Server listening on port: ${port}...`);
})