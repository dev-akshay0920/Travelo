import { Router } from "express";
import type { Request, Response } from "express";
import { asyncHandler } from "../shared/utils/async-handler";
import { success } from "../shared/responses/api-response";
import { Package } from "../modules/packages/package.model";
import { Agency } from "../modules/agencies/agency.model";
import type { Types } from "mongoose";

const router = Router();

// Default fallback data
function getDefaultPackagesResponse() {
  return {
    items: [],
    total: 0,
    page: 1,
    totalPages: 0,
    facets: {
      destinations: [],
      themes: [],
      priceRange: { min: 0, max: 1000000 },
      durations: { min: 1, max: 30 },
    },
  };
}

function getDefaultTrustBadges() {
  return [
    { id: "1", icon: "shield", title: "Verified Agencies Only", description: "Every agency undergoes KYC verification, license checks, and quality audits before listing.", color: "blue", order: 1, isActive: true },
    { id: "2", icon: "star", title: "Authentic Reviews", description: "Reviews only from verified bookings. No fake ratings, no paid promotions.", color: "amber", order: 2, isActive: true },
    { id: "3", icon: "credit-card", title: "Best Price Guarantee", description: "Found it cheaper elsewhere? We'll match it. Transparent pricing with no hidden fees.", color: "emerald", order: 3, isActive: true },
    { id: "4", icon: "message-square", title: "24/7 Travel Support", description: "Dedicated support before, during, and after your trip. We're here when you need us.", color: "purple", order: 4, isActive: true },
    { id: "5", icon: "lock", title: "Secure Payments", description: "PCI-DSS compliant payment processing. Your financial data is encrypted and protected.", color: "green", order: 5, isActive: true },
    { id: "6", icon: "settings", title: "Customizable Trips", description: "Tailor any package to your preferences. Add experiences, upgrade hotels, extend stays.", color: "indigo", order: 6, isActive: true },
  ];
}

// GET /api/v1/public/packages
router.get(
  "/packages",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      page = "1",
      limit = "24",
      destination,
      destinations,
      theme,
      priceMin,
      priceMax,
      startDate,
      endDate,
      flexibleDates,
      adults,
      children,
      durationMin,
      durationMax,
      geographicScope,
      agencySlug,
      sortBy = "recommended",
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 24;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {
      status: "active",
      visibility: "public",
    };

    if (destination) {
      filter.destination = { $regex: destination, $options: "i" };
    }

    if (destinations) {
      const destArray = (destinations as string).split(",");
      filter["destinations.city"] = { $in: destArray.map(d => new RegExp(d, "i")) };
    }

    if (theme) {
      const themeArray = (theme as string).split(",");
      filter.tripTheme = { $in: themeArray };
    }

    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = parseInt(priceMin as string);
      if (priceMax) filter.price.$lte = parseInt(priceMax as string);
    }

    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate as string);
      if (endDate) filter.startDate.$lte = new Date(endDate as string);
    }

    if (flexibleDates === "true" && (startDate || endDate)) {
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      if (startDate) {
        const date = new Date(startDate as string);
        filter.startDate.$gte = new Date(date.getTime() - threeDays);
      }
      if (endDate) {
        const date = new Date(endDate as string);
        filter.startDate.$lte = new Date(date.getTime() + threeDays);
      }
    }

    if (adults) {
      filter.minTravelers = { $lte: parseInt(adults as string) };
    }
    if (children) {
      filter.maxTravelers = { $gte: parseInt(children as string) };
    }

    if (durationMin || durationMax) {
      filter.durationDays = {};
      if (durationMin) filter.durationDays.$gte = parseInt(durationMin as string);
      if (durationMax) filter.durationDays.$lte = parseInt(durationMax as string);
    }

    if (geographicScope) {
      filter.geographicScope = geographicScope;
    }

if (agencySlug) {
      const agency = await (Agency as any).findOne({ slug: agencySlug }).select("_id").lean();
      if (agency) {
        filter.agencyId = agency._id;
      } else {
        return res.json(success(getDefaultPackagesResponse()));
      }
    }

    let sort: any = { createdAt: -1 };
    switch (sortBy) {
      case "price_asc":
        sort = { price: 1 };
        break;
      case "price_desc":
        sort = { price: -1 };
        break;
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "popular":
        sort = { "meta.inquiries": -1 };
        break;
      case "ending_soon":
        sort = { endDate: 1 };
        break;
      case "recommended":
      default:
        sort = { isFeatured: -1, createdAt: -1 };
        break;
    }

    const [packages, total] = await Promise.all([
      (Package as any).find(filter)
        .populate("agencyId", "name slug logo")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Package.countDocuments(filter),
    ]);

    const publicPackages = (
      packages as Array<
        Record<string, unknown> & {
          _id: Types.ObjectId;
          agencyId:
            | Types.ObjectId
            | {
                _id?: Types.ObjectId;
                name?: string;
                slug?: string;
                logo?: { url?: string };
              };
        }
      >
    ).map((pkg) => {
      const agencyReference = pkg.agencyId;
      const agency =
        typeof agencyReference === "object" && "name" in agencyReference
          ? agencyReference
          : undefined;

      return {
        ...pkg,
        id: String(pkg._id),
        agencyId: agency
          ? String(agency._id ?? "")
          : String(agencyReference),
        agencyName: agency?.name ?? "",
        agencySlug: agency?.slug ?? "",
        agencyLogo: agency?.logo?.url,
      };
    });

    const [destinationsAgg, themesAgg, priceRangeAgg, durationsAgg] = await Promise.all([
      Package.aggregate([
        { $match: { status: "active", visibility: "public" } },
        { $unwind: "$destinations" },
        { $group: { _id: "$destinations.city", count: { $sum: 1 }, state: { $first: "$destinations.state" }, country: { $first: "$destinations.country" } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
        { $project: { city: "$_id", state: 1, country: 1, count: 1, _id: 0 } },
      ]),
      Package.aggregate([
        { $match: { status: "active", visibility: "public" } },
        { $group: { _id: "$tripTheme", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { theme: "$_id", count: 1, _id: 0 } },
      ]),
      Package.aggregate([
        { $match: { status: "active", visibility: "public" } },
        { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } },
      ]),
      Package.aggregate([
        { $match: { status: "active", visibility: "public" } },
        { $group: { _id: null, min: { $min: "$durationDays" }, max: { $max: "$durationDays" } } },
      ]),
    ]);

    const facets = {
      destinations: destinationsAgg,
      themes: themesAgg,
      priceRange: priceRangeAgg[0] || { min: 0, max: 1000000 },
      durations: durationsAgg[0] || { min: 1, max: 30 },
    };

    return res.json(success({
      items: publicPackages,
      total,
      page: parseInt(req.query.page as string, 10) || 1,
      totalPages: Math.ceil(total / parseInt(limit as string, 10) || 24),
      facets,
    }));
  })
);

// GET /api/v1/public/agencies
router.get(
  "/agencies",
  asyncHandler(async (req: Request, res: Response) => {
    const requestedLimit = Number.parseInt(String(req.query.limit ?? "8"), 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 24)
      : 8;

    const agencies = await Agency.aggregate<{
      _id: Types.ObjectId;
      name: string;
      slug: string;
      logo?: { url?: string } | null;
      location?: { city?: string; state?: string; country?: string };
      packageCount: number;
    }>([
      { $match: { status: "approved" } },
      {
        $lookup: {
          from: Package.collection.name,
          let: { agencyId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$agencyId", "$$agencyId"] },
                    { $eq: ["$status", "active"] },
                    { $eq: ["$visibility", "public"] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "packageStats",
        },
      },
      {
        $addFields: {
          packageCount: {
            $ifNull: [{ $arrayElemAt: ["$packageStats.count", 0] }, 0],
          },
        },
      },
      { $sort: { packageCount: -1, createdAt: -1 } },
      { $limit: limit },
      { $project: { name: 1, slug: 1, logo: 1, location: 1, packageCount: 1 } },
    ]).exec();

    const items = agencies.map((agency) => ({
      id: String(agency._id),
      name: agency.name,
      slug: agency.slug,
      logo: agency.logo?.url,
      destination:
        [agency.location?.city, agency.location?.state, agency.location?.country]
          .filter(Boolean)
          .join(", ") || "Location not provided",
      packageCount: agency.packageCount,
    }));

    return res.json(success({ items }));
  })
);

// GET /api/v1/public/stats
router.get(
  "/stats",
  asyncHandler(async (_req: Request, res: Response) => {
    const [agencyCount, packageCount] = await Promise.all([
      Agency.estimatedDocumentCount({ status: "approved" }),
      Package.estimatedDocumentCount({ status: "active", visibility: "public" }),
    ]);

    const ratingAgg = await Package.aggregate([
      { $match: { status: "active", visibility: "public", "meta.rating": { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: "$meta.rating" }, totalReviews: { $sum: "$meta.reviewCount" } } },
    ]);

    const avgRating = ratingAgg[0]?.avgRating || 4.8;
    const totalReviews = ratingAgg[0]?.totalReviews || 0;

    return res.json(success({
      verifiedAgencies: agencyCount,
      happyTravellers: Math.round(packageCount * 12),
      totalPackages: packageCount,
      destinations: 120,
      avgRating: Number(avgRating.toFixed(1)),
      totalReviews,
    }));
  })
);

// GET /api/v1/public/destinations
router.get(
  "/destinations",
  asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    if (!q || (q as string).length < 2) {
      return res.json(success([]));
    }

    const destinations = await Package.aggregate([
      { $match: { status: "active", visibility: "public" } },
      { $unwind: "$destinations" },
      { $match: { "destinations.city": { $regex: q, $options: "i" } } },
      { $group: { _id: "$destinations.city", state: { $first: "$destinations.state" }, country: { $first: "$destinations.country" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { city: "$_id", state: 1, country: 1, count: 1, _id: 0 } },
    ]);

    return res.json(success(destinations));
  })
);

// GET /api/v1/public/features
router.get(
  "/features",
  asyncHandler(async (_req: Request, res: Response) => {
    return res.json(success([
      { id: "1", icon: "search", title: "Smart Search", description: "AI-powered recommendations based on your preferences and travel history", color: "blue", order: 1, isActive: true },
      { id: "2", icon: "sparkles", title: "Side-by-Side Compare", description: "Compare packages, prices, and inclusions in one view", color: "purple", order: 2, isActive: true },
      { id: "3", icon: "map-pin", title: "Flexible Dates", description: "Search with flexible dates to find the best deals", color: "amber", order: 3, isActive: true },
      { id: "4", icon: "map-pin", title: "Interactive Maps", description: "Visualize your journey with interactive maps and itineraries", color: "emerald", order: 4, isActive: true },
      { id: "5", icon: "message-square", title: "Direct Chat", description: "Message agencies directly without sharing personal contact info", color: "rose", order: 5, isActive: true },
      { id: "6", icon: "star", title: "Wishlist & Alerts", description: "Save favorite packages and get price drop alerts", color: "indigo", order: 6, isActive: true },
    ]));
  })
);

// GET /api/v1/public/trust-badges
router.get(
  "/trust-badges",
  asyncHandler(async (_req: Request, res: Response) => {
    return res.json(success(getDefaultTrustBadges()));
  })
);

export const publicRouter = router;