const { UserSchema } = require("../models/User")
const { StatusCodes } = require("http-status-codes")

const { BadRequestError, NotFoundError, UnauthorizedError, ConflictError } = require("../errors");
const { noDoubleNestedGroup } = require("sequelize/lib/utils/deprecations");
const { where } = require("sequelize");

const User = UserSchema;

// ─── Cookie Options ───────────────────────────────────────────────────────────
const cookieOptions = {
    httpOnly: true,                                         // ← JS cannot access the cookie
    // secure: process.env.NODE_ENV === "production",          // ← HTTPS only in production
    // sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",  // ← CSRF protection
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,                       // ← 7 days in milliseconds
    domain: ".nighthawks0230.com"
};

clearOptions = {
    secure: true,
    sameSite: "none",
    domain: ".nighthawks0230.com"
}


const login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Check if email and password are provided
    if (!email || !password) {
        throw new BadRequestError("Please provide email and password");
    }

    // 2. Find user by email
    const user = await User.findOne({ where: { email } });

    // 3. Check if user exists
    if (!user) {
        throw new NotFoundError("No account found with this email")
    }

    // 4. Verify password
    const isPasswordValid = await user.isValidPassword(password)

    if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid email or password")
    }

    // 5. Generate JWT token
    const token = user.generateToken()

    res.cookie("token", token, cookieOptions)

    res.cookie("user", JSON.stringify({
        user_id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
    }), cookieOptions)

    res.status(StatusCodes.OK).json({
        success: true,
        message: "Login successful",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
        }
    })
}

const logout = async (req, res) => {
    res.clearCookie("user", { ...clearOptions, httpOnly: true })
    res.clearCookie("token", { ...clearOptions, httpOnly: true })

    res.status(StatusCodes.OK).json({ smessage: "Logged out successfully" })
}

const register = async (req, res) => {
    const { name, email, password, image } = req.body

    // 1. Check if all requierd fields are provided
    if (!name || !email || !password) {
        throw new BadRequestError("Please provide name, email and password")
    }

    // 2. Check if email alredy exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
        throw new ConflictError("This email address is already registered")
    }

    // 3. Create a new user
    const user = await User.create({
        name,
        email,
        password,
        image
    })

    // 4. Generate JWT token
    const token = user.generateToken()

    // 5. Set cookies
    if (user) {
        res.cookie("token", token, cookieOptions);
        res.cookie("user", JSON.stringify({
            userId: user.id,
            name: user.name,
            email: user.email,
        }), cookieOptions);

        res.status(StatusCodes.CREATED).json({
            user_id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
        })
    } else {
        throw new BadRequestError("Unable to create new user. Try again later")
    }
}

module.exports = {
    login,
    logout,
    register
}