require("dotenv").config();
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const connectDB = require("./db");

require("./passport");

const app = express();

app.set("trust proxy", 1);
app.use(cors());
app.use(cors({
    origin: "*"
}));
app.use(passport.initialize());

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

app.use(express.json());
app.get("/health", (req, res) => {
  console.log('health checkup successful')
  res.status(200).send("OK");
});
app.use("/api", require("./routes/extract"));
app.use("/api", require("./routes/jobs"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on http://localhost:5000");
});
