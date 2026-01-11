import dotenv from "dotenv";
dotenv.config();
import express, { urlencoded, json } from "express";
import passport from 'passport';
import jwt from 'jsonwebtoken';
import cors from "cors";
import connectDB from "./db.js";
import "./passport-config.js";
import extractRoutes from "./routes/extract.js";
import linkedinRoutes from "./routes/linkedin.js";
import jobsRoutes from "./routes/jobs.js";
import resumeRoutes from "./routes/resumes.js";
import emailRoutes from "./routes/email.js";
import './workers/extractionWorker.js';

const app = express();

app.set("trust proxy", 1);
app.use(cors());
app.use(cors({
    origin: "*"
}));
app.use(passport.initialize());
app.use(urlencoded({ extended: true }));

connectDB();

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(
      `${process.env.CLIENT_URL}/login-success.html?token=${token}`
    );
  }
);

app.use(json());
app.get("/health", (req, res) => {
  console.log('health checkup successful')
  res.status(200).send("OK");
});

app.use("/api/ai", extractRoutes);
app.use("/api/linkedin", linkedinRoutes);
app.use("/api", jobsRoutes);
app.use("/api", resumeRoutes);
app.use("/api/email", emailRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on http://localhost:5000");
});
