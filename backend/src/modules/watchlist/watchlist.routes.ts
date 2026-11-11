import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import {
  getSavedStatus,
  toggleWatchlist,
  getWatchlist,
  isPackageSaved,
  isAgencySaved,
} from "./watchlist.controller";
import {
  listWatchlistQuerySchema,
  savedStatusSchema,
  toggleWatchlistSchema,
  watchlistAgencyIdParamsSchema,
  watchlistIdParamsSchema,
} from "./watchlist.validation";

const router = Router();

router.use(authMiddleware);
router.post("/saved-status", validate(savedStatusSchema), getSavedStatus);
router.post("/toggle", validate(toggleWatchlistSchema), toggleWatchlist);
router.get("/", validate(listWatchlistQuerySchema, "query"), getWatchlist);
router.get("/:packageId/saved", validate(watchlistIdParamsSchema, "params"), isPackageSaved);
router.get("/agency/:agencyId/saved", validate(watchlistAgencyIdParamsSchema, "params"), isAgencySaved);

export const watchlistRouter = router;
