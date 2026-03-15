require("dotenv").config()
const express = require("express")

const sequelize = require("./db/connect")

const port = process.env.PORT || 5000

const app = express()

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