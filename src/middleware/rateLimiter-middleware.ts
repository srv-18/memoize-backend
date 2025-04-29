import rateLimit from "express-rate-limit";

export const ratelimitter = rateLimit({
    windowMs: 10 * 1000,
    max: 10,
    message: "Maximum request limit reached",
    statusCode: 429
})