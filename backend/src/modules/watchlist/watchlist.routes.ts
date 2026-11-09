import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { toggleWatchlist, getWatchlist, isPackageSaved, isAgencySaved } from "./watchlist.controller";

const router = Router();

router.use(authMiddleware);

router.post("/toggle", toggleWatchlist);
router.get("/", getWatchlist);
router.get("/:packageId/saved", isPackageSaved);
router.get("/agency/:agencyId/saved", isAgencySaved);

export const watchlistRouter = router;
