const express = require("express");
const app = express();
const cors = require('cors');
require('dotenv').config();
const connectDb = require("./src/Config/db");
const authRoute = require("./src/Routes/authRoute")


app.use(express.json());
const port = process.env.port;
app.use(cors());
connectDb();


app.use('/auth', authRoute);


app.listen(port, () => {
    console.log(`Server is running on ${port}`)
});