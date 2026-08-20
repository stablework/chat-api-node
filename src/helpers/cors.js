const extraOrigins = (process.env.CLIENT_URLS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://corp.goodbusinessdev.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...extraOrigins,
]
  .filter(Boolean)
  .map((value) => value.replace(/\/$/, ""));

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

module.exports = {
  allowedOrigins,
  corsOptions,
};
