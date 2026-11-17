import { Router } from "express";
import { asyncHandler } from "../shared/utils/async-handler";
import { success } from "../shared/responses/api-response";

import { agencyRouter } from "../modules/agencies/agency.routes";
import { authRouter } from "../modules/auth/auth.routes";
import { leadWebhookRouter } from "../modules/lead-webhook/lead-webhook.routes";
import { packageRouter } from "../modules/packages/package.routes";
import { publicRouter } from "./public.routes";
import { watchlistRouter } from "../modules/watchlist/watchlist.routes";
import { chatRouter } from "../modules/chat/chat.routes";
import { reviewsRouter } from "../modules/reviews/reviews.routes";
import { leadRouter } from "../modules/leads/lead.routes";
import { leadPipelineRouter } from "../modules/lead-pipeline/lead-pipeline.routes";
import { leadSourceRouter } from "../modules/lead-source/lead-source.routes";
import { leadActivityRouter } from "../modules/lead-activity/lead-activity.routes";
import { followUpReminderRouter } from "../modules/follow-up-reminder/follow-up-reminder.routes";
import { userRouter } from "../modules/users/user.routes";
import adminRouter from "../modules/admin/admin.routes";
import itineraryRouter from "../modules/itinerary/itinerary.routes";
import quotationRouter from "../modules/quotation/quotation.routes";
import bookingRouter from "../modules/booking/booking.routes";
import invoiceRouter from "../modules/invoice/invoice.routes";
import reportRoutes from "../modules/reports/report.routes";
import supplierRouter from "../modules/supplier/supplier.routes";
import documentRouter from "../modules/document/document.routes";
import bookingPaymentRouter from "../modules/booking-payment/booking-payment.routes";
import taskRouter from "../modules/task/task.routes";
import staffRouter from "../modules/staff/staff.routes";
import subscriptionPlanRouter from "../modules/saas-billing/subscription-plan.routes";
import agencySubscriptionRouter from "../modules/saas-billing/agency-subscription.routes";
import platformInvoiceRouter from "../modules/saas-billing/platform-invoice.routes";
import auditRoutes from "../modules/audit/audit.routes";

const router = Router();

router.get(
  "/",
  asyncHandler((_req, res) => {
    res.status(200).json(
      success(
        {
          name: "Travora API",
          version: "v1",
          stage: "foundation",
          status: "running",
        },
        { timestamp: new Date().toISOString() }
      )
    );
  })
);

router.use("/webhooks/leads", leadWebhookRouter);
router.use("/auth", authRouter);
router.use("/agencies", agencyRouter);
router.use("/packages", packageRouter);
router.use("/public", publicRouter);
router.use("/watchlist", watchlistRouter);
router.use("/chat", chatRouter);
router.use("/reviews", reviewsRouter);
router.use("/leads/pipeline", leadPipelineRouter);
router.use("/leads/sources", leadSourceRouter);
router.use("/leads/:leadId/activities", leadActivityRouter);
router.use("/leads", leadRouter);
router.use("/followups", followUpReminderRouter);
router.use("/itineraries", itineraryRouter);
router.use("/quotations", quotationRouter);
router.use("/bookings", bookingRouter);
router.use("/invoices", invoiceRouter);
router.use("/reports", reportRoutes);
router.use("/suppliers", supplierRouter);
router.use("/documents", documentRouter);
router.use("/booking-payments", bookingPaymentRouter);
router.use("/tasks", taskRouter);
router.use("/staff", staffRouter);
router.use("/subscription-plans", subscriptionPlanRouter);
router.use("/agency-subscriptions", agencySubscriptionRouter);
router.use("/platform-invoices", platformInvoiceRouter);
router.use("/users", userRouter);
router.use("/admin", adminRouter);
router.use("/audit", auditRoutes);

export const apiV1Router: Router = router;
