import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

import {
  StaffMemberSchema,
  EventCoordinatorSchema,
} from "../schemas/applications.js";

import { createApplicationHandler } from "../utils/createApplicationHandler.js";

import { buildStaffEmbed, buildEventEmbed } from "../utils/embeds.js";

const staffLimiter = rateLimit({
  windowMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  max: 1,
  keyGenerator: (req) => req.user.id,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "You have already submitted a staff application.",
    });
  },
});

const eventLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  max: 3,
  keyGenerator: (req) => req.user.id,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "You have reached the daily event application limit.",
    });
  },
});

router.post(
  "/staff",
  requireAuth,
  staffLimiter,
  createApplicationHandler(StaffMemberSchema, buildStaffEmbed),
);

router.post(
  "/event",
  requireAuth,
  eventLimiter,
  createApplicationHandler(EventCoordinatorSchema, buildEventEmbed),
);

export default router;
