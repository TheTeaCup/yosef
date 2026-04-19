import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/event", requireAuth, (req, res) => {
  res.json({ error: false, message: "WIP" });
});

router.post("/server", requireAuth, (req, res) => {
  res.json({ error: false, message: "WIP" });
});

router.post("/appalcart", requireAuth, (req, res) => {
  res.json({ error: false, message: "WIP" });
});

export default router;