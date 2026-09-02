require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const pool = require("./db");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());

app.use(express.json({
    limit: "10kb"
}));

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ?
        process.env.ALLOWED_ORIGINS.split(",") :
        []
}));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
}));

app.get("/", async (req, res, next) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            status: "online",
            database: "connected",
            time: result.rows[0].now
        });
    } catch (error) {
        next(error);
    }
});
// Error handler harus berada PALING BAWAH,
// setelah seluruh route.
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== "production") {
        console.error(err);
    } else {
        console.error(err.message);
    }
    
    res.status(500).json({
        error: "Internal server error"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Birthday API berjalan di port ${PORT}`);
});