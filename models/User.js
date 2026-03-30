const { DataTypes, Sequelize, DATE } = require("sequelize")
const sequelize = require("../db/connect")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const SALT_ROUNDS = 10

const UserSchema = sequelize.define(
    "Users",
    {
        "id": {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [2, 100],
                    msg: "Name must be between 2 and 100 character long",
                },
                notNull: {
                    msg: "Name is required",
                },
                notEmpty: {
                    msg: "Name cannot be empty",
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: "This email address is already registered",
            },
            set(value) {
                this.setDataValue("email", value.toLowerCase()).trim()
            },
            validate: {
                isEmail: {
                    msg: "Please provide a valid email address",
                },
                notNull: {
                    msg: "Email is required",
                },
                notEmpty: {
                    msg: "Email cannot be empty",
                },
                len: {
                    args: [5, 255],
                    msg: "Email must be between 5 and 255 characters long",
                }
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Password is required",
                },
                notEmpty: {
                    msg: "Password cannot be empty",
                },
                len: {
                    args: [2, 128],
                    msg: "Password must be between 8 and 128 characters long",
                },
                isStrongPassword(value) {
                    if (!/[A-Z]/.test(value)) {
                        throw new Error("Password must contain at least one uppercasr letter");
                    }
                    if (!/[a-z]/.test(value)) {
                        throw new Error("Password must contain at least one lowercase letter");
                    }
                    if (!/[0-9]/.test(value)) {
                        throw new Error("Password must contain at least one number");
                    }
                    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
                        throw new Error("Password must contain at least one special character");
                    }
                }

            },

        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "/img/default-proile.png",
            validate: {
                isUrl: {
                    msg: "Profile picture must be a valid URL"
                }
            }
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        }

    },
    {
        freezeTableName: true,
        timestamps: true,       // ← auto sets createdAt on INSERT, updatedAt on UPDATE
        underscored: true,
        hooks: {
            beforeSave: async (user) => {
                if (user.changed("password")) {
                    user.password = await bcrypt.hash(user.password, SALT_ROUNDS)
                }
            }
        }
    }
)

UserSchema.prototype.isValidPassword = async function (enteredPasswrod) {
    return await bcrypt.compare(enteredPasswrod, this.password)
}

// Sync the table and show messages
const syncUserTable = async () => {
    try {
        await UserSchema.sync({ alter: true })
        console.log("✅ Users table synced successfully")
    } catch (error) {
        console.error("❌ Failed to sync Users table:", error.message);
        process.exit(1);
    }
}

syncUserTable()

module.exports = UserSchema