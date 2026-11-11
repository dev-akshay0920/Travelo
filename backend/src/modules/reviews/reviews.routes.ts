import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { submitReview, getReviews, getReviewStats, updateReview, deleteReview } from "./reviews.controller";

const router = Router();

router.post("/", authMiddleware, submitReview);
router.get("/", getReviews);
router.get("/stats", getReviewStats);
router.patch("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

export const reviewsRouter = router;
