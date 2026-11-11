import { Router } from "express";
import type { Request, Response } from "express";
import { asyncHandler } from "../shared/utils/async-handler";
import { success } from "../shared/responses/api-response";
import { Package } from "../modules/packages/package.model";
import { Agency } from "../modules/agencies/agency.model";
import { Review } from "../modules/reviews/reviews.model";
import { Types } from "mongoose";
import type { FilterQuery } from "mongoose";
import { z } from "zod";
import type { PackageDocument } from "../modules/packages/package.model";

const queryValueSchema = z.union([z.string().max(1000), z.array(z.string().max(100)).max(20)]).optional();
const dateQuerySchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
  })
  .optional();
const publicPackageStatusSchema = z.union([
  z.enum(["active", "sold_out"]),
  z.array(z.enum(["active", "sold_out"])).max(2),
]).default(["active", "sold_out"]);
const publicPackageThemeSchema = z.union([
  z.enum(["honeymoon", "family", "adventure", "pilgrimage", "corporate", "leisure", "weekend", "custom"]),
  z.array(z.enum(["honeymoon", "family", "adventure", "pilgrimage", "corporate", "leisure", "weekend", "custom"])).max(8),
]).optional();

const publicPackagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(24),
  destination: z.string().trim().max(100).optional(),
  destinations: queryValueSchema,
  theme: publicPackageThemeSchema,
  status: publicPackageStatusSchema,
  priceMin: z.coerce.number().finite().min(0).max(100_000_000).optional(),
  priceMax: z.coerce.number().finite().min(0).max(100_000_000).optional(),
  startDate: dateQuerySchema,
  endDate: dateQuerySchema,
  flexibleDates: z.enum(["true", "false"]).optional(),
  adults: z.coerce.number().int().min(0).max(30).optional(),
  children: z.coerce.number().int().min(0).max(30).optional(),
  infants: z.coerce.number().int().min(0).max(30).optional(),
  durationMin: z.coerce.number().int().min(1).max(365).optional(),
  durationMax: z.coerce.number().int().min(1).max(365).optional(),
  geographicScope: z.enum(["domestic", "international", "regional"]).optional(),
  agencySlug: z.string().regex(/^[a-z0-9-]{1,100}$/i).optional(),
  sortBy: z.enum(["recommended", "price_asc", "price_desc", "newest", "popular", "ending_soon"]).default("recommended"),
}).strict().refine((query) => query.priceMin === undefined || query.priceMax === undefined || query.priceMin <= query.priceMax, {
  message: "Minimum price must not exceed maximum price.",
  path: ["priceMax"],
}).refine((query) => query.durationMin === undefined || query.durationMax === undefined || query.durationMin <= query.durationMax, {
  message: "Minimum duration must not exceed maximum duration.",
  path: ["durationMax"],
}).refine((query) => !query.startDate || !query.endDate || query.startDate <= query.endDate, {
  message: "Start date must not be after end date.",
  path: ["endDate"],
});

const router = Router();

function getQueryValues(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap((item) =>
    typeof item === "string" ? item.split(",").filter(Boolean) : []
  );
}

function getQueryValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return getQueryValue(value[0]);
  return undefined;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
    const parsedQuery = publicPackagesQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid package search filters.",
          details: parsedQuery.error.flatten(),
        },
      });
    }

    const {
      page: pageNum,
      limit: limitNum,
      destination,
      destinations,
      theme,
      status,
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
      sortBy,
    } = parsedQuery.data;
    const skip = (pageNum - 1) * limitNum;
    const destinationValue = getQueryValue(destination)?.trim();
    const destinationFilters = getQueryValues(destinations);
    const themeFilters = getQueryValues(theme);
    const statusFilters = getQueryValues(status);
    const startDateValue = startDate;
    const endDateValue = endDate;
    const priceMinValue = priceMin;
    const priceMaxValue = priceMax;
    const flexibleDatesValue = flexibleDates;
    const adultsValue = adults;
    const childrenValue = children;
    const durationMinValue = durationMin;
    const durationMaxValue = durationMax;
    const geographicScopeValue = geographicScope;
    const agencySlugValue = agencySlug;
    const sortByValue = sortBy;
    const now = new Date();
    const approvedAgencyIds = await Agency.distinct("_id", { status: "approved" }).exec();
    if (approvedAgencyIds.length === 0) {
      return res.json(success(getDefaultPackagesResponse()));
    }

    const filter: FilterQuery<PackageDocument> = {
      status: { $in: statusFilters },
      visibility: "public",
      agencyId: { $in: approvedAgencyIds },
    };

    if (destinationValue) {
      const destinationRegex = new RegExp(escapeRegex(destinationValue), "i");
      filter.$or = [
        { destination: destinationRegex },
        { "destinations.city": destinationRegex },
      ];
    }

    if (destinationFilters.length > 0) {
      filter["destinations.city"] = {
        $in: destinationFilters.map((city) => new RegExp(`^${escapeRegex(city)}$`, "i")),
      };
    }

    if (themeFilters.length > 0) {
      filter.tripTheme = { $in: themeFilters };
    }

    if (priceMinValue !== undefined || priceMaxValue !== undefined) {
      filter.price = {};
      if (priceMinValue !== undefined) filter.price.$gte = priceMinValue;
      if (priceMaxValue !== undefined) filter.price.$lte = priceMaxValue;
    }

    const dateWindow = flexibleDatesValue === "true" ? 3 : 0;
    const startDateFilter: Record<string, Date> = { $gt: now };
    if (startDateValue || endDateValue) {
      if (startDateValue) {
        const date = new Date(`${startDateValue}T00:00:00.000Z`);
        date.setUTCDate(date.getUTCDate() - dateWindow);
        if (date > now) startDateFilter.$gte = date;
        if (flexibleDatesValue === "true" && !endDateValue) {
          const latestStartDate = new Date(`${startDateValue}T00:00:00.000Z`);
          latestStartDate.setUTCDate(latestStartDate.getUTCDate() + dateWindow + 1);
          startDateFilter.$lt = latestStartDate;
        }
      }
      if (endDateValue) {
        const date = new Date(`${endDateValue}T00:00:00.000Z`);
        date.setUTCDate(date.getUTCDate() + dateWindow + 1);
        startDateFilter.$lt = date;
        if (flexibleDatesValue === "true" && !startDateValue) {
          const earliestStartDate = new Date(`${endDateValue}T00:00:00.000Z`);
          earliestStartDate.setUTCDate(earliestStartDate.getUTCDate() - dateWindow);
          if (earliestStartDate > now) startDateFilter.$gte = earliestStartDate;
        }
      }
    }
    filter.startDate = startDateFilter;
    filter.$and = [{
      $or: [
        { bookingDeadline: { $exists: false } },
        { bookingDeadline: { $gte: now } },
      ],
    }, {
      $or: [
        { status: "sold_out" },
        { availableSeats: { $gt: 0 } },
      ],
    }];

    const adultCount = adultsValue ?? 0;
    const childCount = childrenValue ?? 0;
    const travelerCount = adultCount + childCount;
    if (travelerCount > 0) {
      filter.minTravelers = { $lte: travelerCount };
      filter.$and.push(
        {
          $or: [
            { maxTravelers: { $gte: travelerCount } },
            { maxTravelers: { $exists: false } },
          ],
        },
        { availableSeats: { $gte: travelerCount } },
      );
    }

    if (durationMinValue !== undefined || durationMaxValue !== undefined) {
      filter.durationDays = {};
      if (durationMinValue !== undefined) filter.durationDays.$gte = durationMinValue;
      if (durationMaxValue !== undefined) filter.durationDays.$lte = durationMaxValue;
    }

    if (geographicScopeValue) {
      filter.geographicScope = geographicScopeValue;
    }

    if (agencySlugValue) {
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      const agency = await Agency.findOne({ slug: agencySlugValue, status: "approved" }).select("_id").lean();
      if (agency) {
        filter.agencyId = agency._id;
      } else {
        return res.json(success(getDefaultPackagesResponse()));
      }
    }

    let sort: Record<string, 1 | -1> = { isFeatured: -1, createdAt: -1, _id: -1 };
    switch (sortByValue) {
      case "price_asc":
        sort = { price: 1, _id: 1 };
        break;
      case "price_desc":
        sort = { price: -1, _id: -1 };
        break;
      case "newest":
        sort = { createdAt: -1, _id: -1 };
        break;
      case "popular":
        sort = { "meta.inquiries": -1, _id: -1 };
        break;
      case "ending_soon":
        sort = { endDate: 1, _id: 1 };
        break;
      case "recommended":
      default:
        sort = { isFeatured: -1, createdAt: -1 };
        break;
    }

    const [packages, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      Package.find(filter)
        .populate("agencyId", "name slug logo")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Package.countDocuments(filter).exec(),
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

    const facetBaseFilter = {
      status: { $in: statusFilters },
      visibility: "public",
      agencyId: { $in: approvedAgencyIds },
      startDate: { $gt: now },
      availableSeats: { $gt: 0 },
      $and: [{
        $or: [
          { bookingDeadline: { $exists: false } },
          { bookingDeadline: { $gte: now } },
        ],
      }],
    };
    const [destinationsAgg, themesAgg, priceRangeAgg, durationsAgg] = await Promise.all([
      Package.aggregate([
        { $match: facetBaseFilter },
        { $unwind: "$destinations" },
        { $group: { _id: "$destinations.city", count: { $sum: 1 }, state: { $first: "$destinations.state" }, country: { $first: "$destinations.country" } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
        { $project: { city: "$_id", state: 1, country: 1, count: 1, _id: 0 } },
      ]),
      Package.aggregate([
        { $match: facetBaseFilter },
        { $group: { _id: "$tripTheme", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { theme: "$_id", count: 1, _id: 0 } },
      ]),
      Package.aggregate([
        { $match: facetBaseFilter },
        { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } },
      ]),
      Package.aggregate([
        { $match: facetBaseFilter },
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
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      facets,
    }));
  })
);

router.get(
  "/packages/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Package not found." },
      });
    }

    const now = new Date();
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const pkg = await Package.findOne({
      _id: new Types.ObjectId(id),
      status: { $in: ["active", "sold_out"] },
      visibility: "public",
      startDate: { $gt: now },
      $or: [{ bookingDeadline: { $exists: false } }, { bookingDeadline: { $gte: now } }],
    })
      .select("agencyId name slug description destination destinations geographicScope tripTheme durationDays durationNights startDate endDate bookingDeadline price currency priceType minTravelers maxTravelers availableSeats childPolicy infantPolicy taxType taxPercentage priceValidUntil advancePercentage balanceDueDays inclusions exclusions itinerary images highlights termsAndConditions cancellationPolicy status createdAt updatedAt")
      .exec();
    if (!pkg) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Package not found or no longer available." },
      });
    }

    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const agency = await Agency.findOne({
      _id: pkg.agencyId,
      status: "approved",
    })
      .select("name slug logo")
      .exec();
    if (!agency) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Package not found or no longer available." },
      });
    }

    return res.json(success({
      package: {
        id: String(pkg._id),
        agencyId: String(agency._id),
        agencyName: agency.name,
        agencySlug: agency.slug,
        agencyLogo: agency.logo?.url,
        name: pkg.name,
        slug: pkg.slug,
        description: pkg.description,
        destination: pkg.destination,
        destinations: pkg.destinations,
        geographicScope: pkg.geographicScope,
        tripTheme: pkg.tripTheme,
        durationDays: pkg.durationDays,
        durationNights: pkg.durationNights,
        startDate: pkg.startDate.toISOString(),
        endDate: pkg.endDate.toISOString(),
        bookingDeadline: pkg.bookingDeadline?.toISOString(),
        price: pkg.price,
        currency: pkg.currency,
        priceType: pkg.priceType,
        minTravelers: pkg.minTravelers,
        maxTravelers: pkg.maxTravelers,
        availableSeats: pkg.availableSeats,
        childPolicy: pkg.childPolicy,
        infantPolicy: pkg.infantPolicy,
        taxType: pkg.taxType,
        taxPercentage: pkg.taxPercentage,
        priceValidUntil: pkg.priceValidUntil?.toISOString(),
        advancePercentage: pkg.advancePercentage,
        balanceDueDays: pkg.balanceDueDays,
        inclusions: pkg.inclusions,
        exclusions: pkg.exclusions,
        itinerary: pkg.itinerary,
        images: pkg.images,
        highlights: pkg.highlights,
        termsAndConditions: pkg.termsAndConditions,
        cancellationPolicy: pkg.cancellationPolicy,
        status: pkg.status,
        createdAt: pkg.createdAt.toISOString(),
        updatedAt: pkg.updatedAt.toISOString(),
      },
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
    const approvedAgencyIds = await Agency.distinct("_id", { status: "approved" }).exec();
    const [agencyCount, packageCount, ratingAgg] = await Promise.all([
      Agency.countDocuments({ status: "approved" }).exec(),
      Package.countDocuments({
        status: "active",
        visibility: "public",
        agencyId: { $in: approvedAgencyIds },
      }).exec(),
      Review.aggregate([
        { $match: { status: "approved", agencyId: { $in: approvedAgencyIds } } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
      ]),
    ]);

    const avgRating = ratingAgg[0]?.avgRating ?? 0;
    const totalReviews = ratingAgg[0]?.totalReviews ?? 0;

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
    const q = getQueryValue(req.query.q)?.trim();
    if (!q || q.length < 2) {
      return res.json(success([]));
    }
    if (q.length > 100) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Destination search is too long." },
      });
    }

    const approvedAgencyIds = await Agency.distinct("_id", { status: "approved" }).exec();
    if (approvedAgencyIds.length === 0) {
      return res.json(success([]));
    }

    const destinations = await Package.aggregate([
      { $match: { status: "active", visibility: "public", agencyId: { $in: approvedAgencyIds } } },
      { $unwind: "$destinations" },
      { $match: { "destinations.city": { $regex: escapeRegex(q), $options: "i" } } },
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