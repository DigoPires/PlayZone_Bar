import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import healthRouter from "./health";
import authRouter from "./auth";
import reservationsRouter from "./reservations";
import waitlistRouter from "./waitlist";
import galleryRouter from "./gallery";
import menuRouter from "./menu";
import eventsRouter from "./events";
import couponsRouter from "./coupons";
import availabilityRouter from "./availability";
import statsRouter from "./stats";
import settingsRouter from "./settings";
import usersRouter from "./users";

const router = Router();

// Health and auth — always public
router.use(healthRouter);
router.use(authRouter);

// Mixed access routers (inline auth guards applied inside each file)
router.use(reservationsRouter);
router.use(galleryRouter);
router.use(menuRouter);
router.use(eventsRouter);
router.use(settingsRouter);
router.use(couponsRouter);

// Fully admin-gated routers
router.use(requireAdmin, waitlistRouter);
router.use(requireAdmin, availabilityRouter);
router.use(requireAdmin, statsRouter);
router.use(requireAdmin, usersRouter);

export default router;
