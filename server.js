import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import connectDB from "./config/db.js";
import jobRoutes from "./routes/jobRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(compression());

app.use("/api/jobs", jobRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("🌐 Job Portal API is running...");
});

connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
