require("dotenv").config()
const express = require("express")

const sequelize = require("./db/connect")
const User = require("./models/User")


// Import routes
const authRouter = require("./routes/auth")
const cookieParser = require("cookie-parser")
const errorHandlerMiddleware = require("./middlewares/error-handler")

const port = process.env.PORT || 5000

const app = express()

// Middlware setup
app.use(express.json())
app.use(cookieParser())

// Test API
app.get("/", (req, res) => {
    console.log("Got new connect")
    res.send("<h1>Hello World</h1>");
});

app.use("/api/v1/auth", authRouter)
app.use(errorHandlerMiddleware)

app.listen(port, async () => {
    try {
        await sequelize.authenticate().then(() => {
            console.log("Connection has been established")
        })

        console.log("Start the API Server at port " + port)

    } catch (error) {
        console.log(error)
    }
})
module.exports = app