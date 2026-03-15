const { Sequelize } = require("sequelize")
require("dotenv").config();

const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD,

    {
        host: process.env.DATABASE_HOST,
        dialect: "postgres",
        logging: process.env.IS_DEV == 'true',
        // logging:true

        dialectOptions: {
            application_name: "todo_app",
        }
    }
)

module.exports = sequelize