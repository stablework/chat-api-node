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

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalized = String(origin).replace(/\/$/, "");
  if (allowedOrigins.includes(normalized)) return true;
  try {
    const { hostname } = new URL(normalized);
    return hostname === "goodbusinessdev.com" || hostname.endsWith(".goodbusinessdev.com");
  } catch (error) {
    return false;
  }
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

module.exports = {
  allowedOrigins,
  corsOptions,
  isAllowedOrigin,
};
