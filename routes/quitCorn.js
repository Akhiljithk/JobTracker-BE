import { Router } from "express";
import quitCornLogs from "../models/quitCornLogs.js";

const router = Router();

router.post("/log", (req, res) => {
  const { event, browserVersion, redirectUrl } = req.body;

  quitCornLogs.create({
    event,
    browserVersion,
    redirectUrl
  }).catch(() => {});

  res.sendStatus(204);
});

export default router;