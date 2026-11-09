import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { submitReview, getReviews, getReviewStats, updateReview, deleteReview } from "./reviews.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", submitReview);
router.get("/", getReviews);
router.get("/stats", getReviewStats);
router.patch("/:id", updateReview);
router.delete("/:id", deleteReview);

export const reviewsRouter = router;
