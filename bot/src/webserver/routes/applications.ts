import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

import {
    StaffMemberSchema,
    EventCoordinatorSchema,
} from "../schemas/applications.js";

import {
    createApplicationHandler,
} from "../utils/createApplicationHandler.js";

import {
    buildStaffEmbed,
    buildEventEmbed,
} from "../utils/embeds.js";

const staffLimiter = rateLimit({
    windowMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    max: 1,
    keyGenerator: (req) => req.user.id,
});

const eventLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 1 day
    max: 1,
    keyGenerator: (req) => req.user.id,
});

router.post(
    "/staff",
    requireAuth,
    staffLimiter,
    createApplicationHandler(StaffMemberSchema, buildStaffEmbed)
);

router.post(
    "/event",
    requireAuth,
    eventLimiter,
    createApplicationHandler(EventCoordinatorSchema, buildEventEmbed)
);

export default router;