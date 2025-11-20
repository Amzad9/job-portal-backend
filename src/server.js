import express from "express";
import dotenv from "dotenv";

// Load environment variables FIRST before importing anything that uses them
// .env is now in the same directory (src/)
dotenv.config();

import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "./config/passport.js";
import connectDB from "./config/db.js";
import jobRoutes from "./routes/jobRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import adzunaRoutes from "./routes/adzunaRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import featuredRoutes from "./routes/featuredRoutes.js";
import savedSearchRoutes from "./routes/savedSearchRoutes.js";
import candidateProfileRoutes from "./routes/candidateProfileRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";
const app = express();

// Initialize Passport with MongoDB session store
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || process.env.MONGODB_URI,
      ttl: 24 * 60 * 60, // 24 hours in seconds
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Log registered strategies for debugging
if (process.env.NODE_ENV !== "production") {
  console.log("📋 Registered Passport strategies:", Object.keys(passport._strategies));
}

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman, or server-side requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all localhost origins
    const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      // Allow any localhost origin in development
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('0.0.0.0')) {
        return callback(null, true);
      }
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS: Origin ${origin} not allowed`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  exposedHeaders: ["Authorization", "Content-Type"],
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400, // 24 hours
};

// Apply CORS middleware - must be before other middleware
app.use(cors(corsOptions));

// Additional middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(compression());

app.use("/api/jobs", jobRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/adzuna", adzunaRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/featured", featuredRoutes);
app.use("/api/saved-searches", savedSearchRoutes);
app.use("/api/candidate-profiles", candidateProfileRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);

app.get("/", (req, res) => {
  res.send("🌐 Job Portal API is running...");
});

// Error handler for CORS and other errors
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    console.error('CORS Error:', {
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins,
      url: req.url
    });
    return res.status(403).json({
      success: false,
      message: 'CORS: Origin not allowed',
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins
    });
  }
  
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

connectDB();
const PORT = process.env.PORT || 5000;

// Import and start cron jobs
if (process.env.ENABLE_ADZUNA_IMPORT !== "false") {
  import("./cron/jobImport.js").catch((error) => {
    console.error("Error loading cron jobs:", error);
  });
}

// Import job alerts cron job
import("./cron/jobAlerts.js").catch((error) => {
  console.error("Error loading job alerts cron:", error);
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
