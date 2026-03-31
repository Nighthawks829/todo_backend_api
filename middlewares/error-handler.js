const { StatusCodes } = require("http-status-codes");
const { escape } = require("sequelize/lib/sql-string");

const errorHandlerMiddleware = (err, req, res, next) => {
    console.error(`❌ [${req.method}] ${req.path} →`, err.message);

    // ✅ 1. Sequelize Validation Error (e.g. name too short, invalid email)
    if (err.name === "SequelizeValidationError") {
        const errors = err.errors.map((e) => ({
            field: e.path,
            message: e.message,
        }));

        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Validation failed",
            errors,
        })
    }

    // ✅ 2. Sequelize Unique Constraint Error (e.g. email already exists)
    if (err.name === "SequelizeUniqueConstraintError") {
        const errors = err.errors.map((e) => ({
            field: e.path,
            message: e.message,
        }))
        return res.status(StatusCodes.CONFLICT).json({
            success: false,
            message: "Duplicate entry",
            errors,
        })
    }

    // ✅ 3. Sequelize Database Connection Error
    if (err.name === "SequlSequelizeConnectionError") {
        return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
            success: false,
            message: "Database connection failed, please try again later"
        })
    }

    // ✅ 4. Sequelize Foreign Key Constraint Error
    if (err.name === "SequelizeForeignKeyConstraintError") {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Invalid reference, related record does not exist",
        })
    }

    // ✅ 5. JWT Error (invalid token)
    if (err.name === "JsonWebTokenError") {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: "Invalid token, please login again",
        })
    }

    // ✅ 6. JWT Expired Error
    if (err.name === "TokenExpiredError") {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: "Token has expired, please login again",
        })
    }

    // ✅ 7. Bad Request Error (e.g. missing fields)
    if (err.statusCode === StatusCodes.BAD_REQUEST) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: err.message || "Bad request"
        })
    }

    // ✅ 8. Not Found Error
    if (err.statusCode === StatusCodes.NOT_FOUND) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: err.message || "Resource not found",
        })
    }

    // ✅ 9. Unauthorized Error
    if (err.statusCode === StatusCodes.UNAUTHORIZED) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: err.message || "Unauthorized access",
        })
    }

    // ✅ 10. Forbidden Error (authenticated but no permission)
    if (err.statusCode === StatusCodes.FORBIDDEN) {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: err.message || "You do not have permissions to access this resource"
        })
    }

    // ✅ Fallback — Internal Server Error
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Something went wrong, please try again later"
    })
}

module.exports = errorHandlerMiddleware;