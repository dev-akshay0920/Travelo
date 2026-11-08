import bcrypt from "bcrypt";
import { Agency } from "../modules/agencies/agency.model";
import type { AgencyService } from "../modules/agencies/agency.model";
import { Package } from "../modules/packages/package.model";
import type { GeographicScope, PackageStatus, TripTheme } from "../modules/packages/package.model";
import { Role } from "../modules/roles/role.model";
import { RoleService } from "../modules/roles/role.service";
import { User } from "../modules/users/user.model";
import { connectDatabase, disconnectDatabase } from "../config/database";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEMO_AGENCY_PASSWORD = "TravoraDemo!2026";
const BCRYPT_SALT_ROUNDS = 12;

const agencies = [
  {
    key: "wanderlust-goa",
    name: "Wanderlust Trails",
    slug: "wanderlust-trails",
    ownerName: "Aarav Mehta",
    ownerEmail: "aarav.mehta@wanderlust-trails.example",
    about: "Thoughtful beach escapes and small-group adventures across Goa and the Konkan coast.",
    yearEstablished: 2015,
    city: "Panaji",
    state: "Goa",
    phone: "+91 90000 10001",
    services: ["tour_packages", "domestic_tours", "honeymoon_trips", "family_holidays"] as AgencyService[],
    logoPhoto: "photo-1488646953014-85cb44e25828",
  },
  {
    key: "himalayan-horizon",
    name: "Himalayan Horizon",
    slug: "himalayan-horizon",
    ownerName: "Tsering Dolma",
    ownerEmail: "tsering.dolma@himalayan-horizon.example",
    about: "Locally guided mountain journeys, from easy family holidays to high-altitude expeditions.",
    yearEstablished: 2012,
    city: "Shimla",
    state: "Himachal Pradesh",
    phone: "+91 90000 10002",
    services: ["tour_packages", "domestic_tours", "adventure_trips", "family_holidays"] as AgencyService[],
    logoPhoto: "photo-1506905925346-21bda4d32df4",
  },
  {
    key: "kerala-coast",
    name: "Kerala Coast & Country",
    slug: "kerala-coast-country",
    ownerName: "Ananya Nair",
    ownerEmail: "ananya.nair@kerala-coast.example",
    about: "Backwater stays, tea-country walks and relaxed family holidays with local hosts.",
    yearEstablished: 2010,
    city: "Kochi",
    state: "Kerala",
    phone: "+91 90000 10003",
    services: ["tour_packages", "domestic_tours", "family_holidays", "honeymoon_trips"] as AgencyService[],
    logoPhoto: "photo-1512343879784-a960bf40e7f2",
  },
  {
    key: "royal-rajasthan",
    name: "Royal Rajasthan Journeys",
    slug: "royal-rajasthan-journeys",
    ownerName: "Rohan Rathore",
    ownerEmail: "rohan.rathore@royal-rajasthan.example",
    about: "Heritage hotels, desert camps and guided journeys through Rajasthan's historic cities.",
    yearEstablished: 2008,
    city: "Jaipur",
    state: "Rajasthan",
    phone: "+91 90000 10004",
    services: ["tour_packages", "domestic_tours", "family_holidays", "adventure_trips"] as AgencyService[],
    logoPhoto: "photo-1477587458883-47145ed94245",
  },
  {
    key: "andaman-odyssey",
    name: "Andaman Odyssey",
    slug: "andaman-odyssey",
    ownerName: "Mira D'Souza",
    ownerEmail: "mira.dsouza@andaman-odyssey.example",
    about: "Island-hopping, reef-safe snorkelling and intimate beach stays in the Andamans.",
    yearEstablished: 2017,
    city: "Port Blair",
    state: "Andaman and Nicobar Islands",
    phone: "+91 90000 10005",
    services: ["tour_packages", "domestic_tours", "honeymoon_trips", "adventure_trips"] as AgencyService[],
    logoPhoto: "photo-1544551763-46a013bb70d5",
  },
  {
    key: "kashmir-alpine",
    name: "Kashmir Alpine Holidays",
    slug: "kashmir-alpine-holidays",
    ownerName: "Sameer Bhat",
    ownerEmail: "sameer.bhat@kashmir-alpine.example",
    about: "Responsible valley stays, guided treks and seasonal Kashmir itineraries.",
    yearEstablished: 2013,
    city: "Srinagar",
    state: "Jammu and Kashmir",
    phone: "+91 90000 10006",
    services: ["tour_packages", "domestic_tours", "honeymoon_trips", "adventure_trips"] as AgencyService[],
    logoPhoto: "photo-1581833971358-2c8b550f87b3",
  },
  {
    key: "sacred-pathways",
    name: "Sacred Pathways India",
    slug: "sacred-pathways-india",
    ownerName: "Kavita Sharma",
    ownerEmail: "kavita.sharma@sacred-pathways.example",
    about: "Carefully paced spiritual journeys with knowledgeable local guides and clear inclusions.",
    yearEstablished: 2011,
    city: "Varanasi",
    state: "Uttar Pradesh",
    phone: "+91 90000 10007",
    services: ["tour_packages", "domestic_tours", "pilgrimage_tours"] as AgencyService[],
    logoPhoto: "photo-1564501049412-61c2a3083791",
  },
  {
    key: "global-getaways",
    name: "Global Getaways",
    slug: "global-getaways-india",
    ownerName: "Nisha Kapoor",
    ownerEmail: "nisha.kapoor@global-getaways.example",
    about: "International holidays with practical planning, reliable local partners and flexible options.",
    yearEstablished: 2016,
    city: "Mumbai",
    state: "Maharashtra",
    phone: "+91 90000 10008",
    services: ["tour_packages", "international_tours", "visa_assistance", "family_holidays", "corporate_travel"] as AgencyService[],
    logoPhoto: "photo-1464822759023-fed622ff2c3b",
  },
] as const;

interface PackageSeed {
  agencyKey: (typeof agencies)[number]["key"];
  slug: string;
  name: string;
  destination: string;
  places: Array<{ city: string; state?: string; country: string }>;
  geographicScope: GeographicScope;
  tripTheme: TripTheme;
  durationDays: number;
  price: number;
  startInDays: number;
  status?: PackageStatus;
  visibility?: "private" | "public";
  isFeatured?: boolean;
  imagePhoto: string;
}

const packages: PackageSeed[] = [
  {
    agencyKey: "wanderlust-goa", slug: "goa-coastal-weekender", name: "Goa Coastal Weekender",
    destination: "Goa, India", places: [{ city: "Panaji", state: "Goa", country: "India" }, { city: "Candolim", state: "Goa", country: "India" }],
    geographicScope: "domestic", tripTheme: "weekend", durationDays: 3, price: 12999, startInDays: 18, isFeatured: true, imagePhoto: "photo-1512343879784-a960bf40e7f2",
  },
  {
    agencyKey: "wanderlust-goa", slug: "goa-sunset-honeymoon", name: "Goa Sunset Honeymoon Escape",
    destination: "Goa, India", places: [{ city: "Candolim", state: "Goa", country: "India" }, { city: "Palolem", state: "Goa", country: "India" }],
    geographicScope: "domestic", tripTheme: "honeymoon", durationDays: 5, price: 36999, startInDays: 42, isFeatured: true, imagePhoto: "photo-1473116763249-2faaef81ccda",
  },
  {
    agencyKey: "wanderlust-goa", slug: "goa-family-beach-holiday", name: "Goa Family Beach Holiday",
    destination: "Goa, India", places: [{ city: "Panaji", state: "Goa", country: "India" }, { city: "Baga", state: "Goa", country: "India" }],
    geographicScope: "domestic", tripTheme: "family", durationDays: 5, price: 27999, startInDays: 70, imagePhoto: "photo-1507525428034-b723cf961d3e",
  },
  {
    agencyKey: "himalayan-horizon", slug: "manali-mountain-adventure", name: "Manali Mountain Adventure",
    destination: "Manali, Himachal Pradesh, India", places: [{ city: "Manali", state: "Himachal Pradesh", country: "India" }, { city: "Solang Valley", state: "Himachal Pradesh", country: "India" }],
    geographicScope: "domestic", tripTheme: "adventure", durationDays: 6, price: 34999, startInDays: 25, isFeatured: true, imagePhoto: "photo-1501785888041-af3ef285b470",
  },
  {
    agencyKey: "himalayan-horizon", slug: "shimla-family-retreat", name: "Shimla Family Hill Retreat",
    destination: "Shimla, Himachal Pradesh, India", places: [{ city: "Shimla", state: "Himachal Pradesh", country: "India" }, { city: "Kufri", state: "Himachal Pradesh", country: "India" }],
    geographicScope: "domestic", tripTheme: "family", durationDays: 5, price: 24999, startInDays: 55, imagePhoto: "photo-1519681393784-d120267933ba",
  },
  {
    agencyKey: "himalayan-horizon", slug: "spiti-valley-expedition", name: "Spiti Valley Small-Group Expedition",
    destination: "Spiti Valley, Himachal Pradesh, India", places: [{ city: "Kaza", state: "Himachal Pradesh", country: "India" }, { city: "Tabo", state: "Himachal Pradesh", country: "India" }],
    geographicScope: "domestic", tripTheme: "adventure", durationDays: 8, price: 62999, startInDays: 92, imagePhoto: "photo-1464822759023-fed622ff2c3b",
  },
  {
    agencyKey: "kerala-coast", slug: "kerala-backwater-escape", name: "Kerala Backwaters & Tea Gardens",
    destination: "Kerala, India", places: [{ city: "Kochi", state: "Kerala", country: "India" }, { city: "Alappuzha", state: "Kerala", country: "India" }, { city: "Munnar", state: "Kerala", country: "India" }],
    geographicScope: "domestic", tripTheme: "leisure", durationDays: 7, price: 42999, startInDays: 35, isFeatured: true, imagePhoto: "photo-1602216056096-3b40cc0c9944",
  },
  {
    agencyKey: "kerala-coast", slug: "munnar-family-holiday", name: "Munnar Nature & Family Holiday",
    destination: "Munnar, Kerala, India", places: [{ city: "Munnar", state: "Kerala", country: "India" }, { city: "Thekkady", state: "Kerala", country: "India" }],
    geographicScope: "domestic", tripTheme: "family", durationDays: 5, price: 28999, startInDays: 78, imagePhoto: "photo-1544735716-392fe2489ffa",
  },
  {
    agencyKey: "kerala-coast", slug: "kochi-weekend-discovery", name: "Kochi Culture Weekend",
    destination: "Kochi, Kerala, India", places: [{ city: "Kochi", state: "Kerala", country: "India" }, { city: "Fort Kochi", state: "Kerala", country: "India" }],
    geographicScope: "domestic", tripTheme: "weekend", durationDays: 3, price: 15999, startInDays: 112, imagePhoto: "photo-1513622470522-26c3c8a854bc",
  },
  {
    agencyKey: "royal-rajasthan", slug: "rajasthan-heritage-triangle", name: "Rajasthan Heritage Triangle",
    destination: "Jaipur, Jodhpur & Udaipur, India", places: [{ city: "Jaipur", state: "Rajasthan", country: "India" }, { city: "Jodhpur", state: "Rajasthan", country: "India" }, { city: "Udaipur", state: "Rajasthan", country: "India" }],
    geographicScope: "domestic", tripTheme: "leisure", durationDays: 7, price: 46999, startInDays: 30, isFeatured: true, imagePhoto: "photo-1477587458883-47145ed94245",
  },
  {
    agencyKey: "royal-rajasthan", slug: "jaisalmer-desert-camp", name: "Jaisalmer Desert Camp Adventure",
    destination: "Jaisalmer, Rajasthan, India", places: [{ city: "Jaisalmer", state: "Rajasthan", country: "India" }, { city: "Sam Sand Dunes", state: "Rajasthan", country: "India" }],
    geographicScope: "domestic", tripTheme: "adventure", durationDays: 5, price: 32999, startInDays: 63, imagePhoto: "photo-1509316785289-025f5b846b35",
  },
  {
    agencyKey: "royal-rajasthan", slug: "udaipur-palace-honeymoon", name: "Udaipur Palace Honeymoon",
    destination: "Udaipur, Rajasthan, India", places: [{ city: "Udaipur", state: "Rajasthan", country: "India" }],
    geographicScope: "domestic", tripTheme: "honeymoon", durationDays: 5, price: 55999, startInDays: 96, imagePhoto: "photo-1566073771259-6a8506099945",
  },
  {
    agencyKey: "andaman-odyssey", slug: "andaman-island-honeymoon", name: "Andaman Island Honeymoon",
    destination: "Port Blair & Havelock, India", places: [{ city: "Port Blair", state: "Andaman and Nicobar Islands", country: "India" }, { city: "Swaraj Dweep", state: "Andaman and Nicobar Islands", country: "India" }],
    geographicScope: "domestic", tripTheme: "honeymoon", durationDays: 6, price: 69999, startInDays: 48, isFeatured: true, imagePhoto: "photo-1544551763-46a013bb70d5",
  },
  {
    agencyKey: "andaman-odyssey", slug: "andaman-reef-adventure", name: "Andaman Reef & Scuba Adventure",
    destination: "Havelock & Neil Island, India", places: [{ city: "Swaraj Dweep", state: "Andaman and Nicobar Islands", country: "India" }, { city: "Shaheed Dweep", state: "Andaman and Nicobar Islands", country: "India" }],
    geographicScope: "domestic", tripTheme: "adventure", durationDays: 7, price: 78999, startInDays: 84, imagePhoto: "photo-1530053969600-caed2596d242",
  },
  {
    agencyKey: "andaman-odyssey", slug: "andaman-family-island-hop", name: "Andaman Family Island Hopper",
    destination: "Andaman Islands, India", places: [{ city: "Port Blair", state: "Andaman and Nicobar Islands", country: "India" }, { city: "Swaraj Dweep", state: "Andaman and Nicobar Islands", country: "India" }],
    geographicScope: "domestic", tripTheme: "family", durationDays: 6, price: 48999, startInDays: 125, imagePhoto: "photo-1500375592092-40eb2168fd21",
  },
  {
    agencyKey: "kashmir-alpine", slug: "kashmir-valley-honeymoon", name: "Kashmir Valley Honeymoon",
    destination: "Srinagar & Gulmarg, India", places: [{ city: "Srinagar", state: "Jammu and Kashmir", country: "India" }, { city: "Gulmarg", state: "Jammu and Kashmir", country: "India" }],
    geographicScope: "domestic", tripTheme: "honeymoon", durationDays: 6, price: 76999, startInDays: 40, isFeatured: true, imagePhoto: "photo-1595815771614-ade9d652a65d",
  },
  {
    agencyKey: "kashmir-alpine", slug: "kashmir-family-valley-tour", name: "Kashmir Family Valley Tour",
    destination: "Srinagar, Pahalgam & Gulmarg, India", places: [{ city: "Srinagar", state: "Jammu and Kashmir", country: "India" }, { city: "Pahalgam", state: "Jammu and Kashmir", country: "India" }, { city: "Gulmarg", state: "Jammu and Kashmir", country: "India" }],
    geographicScope: "domestic", tripTheme: "family", durationDays: 7, price: 58999, startInDays: 102, imagePhoto: "photo-1595815771614-ade9d652a65d",
  },
  {
    agencyKey: "kashmir-alpine", slug: "great-lakes-trek-kashmir", name: "Kashmir Great Lakes Trek",
    destination: "Sonamarg, Jammu and Kashmir, India", places: [{ city: "Sonamarg", state: "Jammu and Kashmir", country: "India" }, { city: "Naranag", state: "Jammu and Kashmir", country: "India" }],
    geographicScope: "domestic", tripTheme: "adventure", durationDays: 8, price: 89999, startInDays: 150, imagePhoto: "photo-1464822759023-fed622ff2c3b",
  },
  {
    agencyKey: "sacred-pathways", slug: "varanasi-ayodhya-pilgrimage", name: "Varanasi & Ayodhya Pilgrimage",
    destination: "Varanasi & Ayodhya, India", places: [{ city: "Varanasi", state: "Uttar Pradesh", country: "India" }, { city: "Ayodhya", state: "Uttar Pradesh", country: "India" }],
    geographicScope: "domestic", tripTheme: "pilgrimage", durationDays: 5, price: 28999, startInDays: 28, isFeatured: true, imagePhoto: "photo-1561361513-2d000a50f0dc",
  },
  {
    agencyKey: "sacred-pathways", slug: "char-dham-yatra-guided", name: "Guided Char Dham Yatra",
    destination: "Uttarakhand, India", places: [{ city: "Yamunotri", state: "Uttarakhand", country: "India" }, { city: "Gangotri", state: "Uttarakhand", country: "India" }, { city: "Kedarnath", state: "Uttarakhand", country: "India" }, { city: "Badrinath", state: "Uttarakhand", country: "India" }],
    geographicScope: "domestic", tripTheme: "pilgrimage", durationDays: 10, price: 95999, startInDays: 135, imagePhoto: "photo-1548013146-72479768bada",
  },
  {
    agencyKey: "sacred-pathways", slug: "varanasi-spiritual-weekend", name: "Varanasi Spiritual Weekend",
    destination: "Varanasi, Uttar Pradesh, India", places: [{ city: "Varanasi", state: "Uttar Pradesh", country: "India" }],
    geographicScope: "domestic", tripTheme: "weekend", durationDays: 3, price: 14999, startInDays: 58, imagePhoto: "photo-1561361513-2d000a50f0dc",
  },
  {
    agencyKey: "global-getaways", slug: "dubai-city-and-desert", name: "Dubai City & Desert Discovery",
    destination: "Dubai, United Arab Emirates", places: [{ city: "Dubai", country: "United Arab Emirates" }, { city: "Abu Dhabi", country: "United Arab Emirates" }],
    geographicScope: "international", tripTheme: "leisure", durationDays: 5, price: 88999, startInDays: 33, isFeatured: true, imagePhoto: "photo-1512453979798-5ea266f8880c",
  },
  {
    agencyKey: "global-getaways", slug: "bali-private-honeymoon", name: "Bali Private Pool Honeymoon",
    destination: "Bali, Indonesia", places: [{ city: "Ubud", country: "Indonesia" }, { city: "Seminyak", country: "Indonesia" }],
    geographicScope: "international", tripTheme: "honeymoon", durationDays: 7, price: 129999, startInDays: 74, isFeatured: true, imagePhoto: "photo-1537996194471-e657df975ab4",
  },
  {
    agencyKey: "global-getaways", slug: "nepal-himalaya-trek", name: "Nepal Himalayan Trail Adventure",
    destination: "Kathmandu & Pokhara, Nepal", places: [{ city: "Kathmandu", country: "Nepal" }, { city: "Pokhara", country: "Nepal" }],
    geographicScope: "regional", tripTheme: "adventure", durationDays: 7, price: 74999, startInDays: 118, imagePhoto: "photo-1544735716-392fe2489ffa",
  },
  {
    agencyKey: "global-getaways", slug: "singapore-family-discovery", name: "Singapore Family Discovery",
    destination: "Singapore", places: [{ city: "Singapore", country: "Singapore" }],
    geographicScope: "international", tripTheme: "family", durationDays: 6, price: 148999, startInDays: 165, imagePhoto: "photo-1525625293386-3f8f99389edd",
  },
  {
    agencyKey: "global-getaways", slug: "thailand-island-leisure", name: "Thailand Island Leisure Escape",
    destination: "Phuket & Krabi, Thailand", places: [{ city: "Phuket", country: "Thailand" }, { city: "Krabi", country: "Thailand" }],
    geographicScope: "international", tripTheme: "leisure", durationDays: 6, price: 82999, startInDays: 188, imagePhoto: "photo-1504214208698-ea1916a2195a",
  },
  {
    agencyKey: "global-getaways", slug: "mumbai-corporate-retreat", name: "Mumbai Leadership & Team Retreat",
    destination: "Mumbai & Alibaug, India", places: [{ city: "Mumbai", state: "Maharashtra", country: "India" }, { city: "Alibaug", state: "Maharashtra", country: "India" }],
    geographicScope: "domestic", tripTheme: "corporate", durationDays: 4, price: 38999, startInDays: 215, imagePhoto: "photo-1497366754035-f200968a6e72",
  },
  {
    agencyKey: "global-getaways", slug: "golden-triangle-custom", name: "Build-Your-Own Golden Triangle",
    destination: "Delhi, Agra & Jaipur, India", places: [{ city: "Delhi", state: "Delhi", country: "India" }, { city: "Agra", state: "Uttar Pradesh", country: "India" }, { city: "Jaipur", state: "Rajasthan", country: "India" }],
    geographicScope: "domestic", tripTheme: "custom", durationDays: 7, price: 65999, startInDays: 245, imagePhoto: "photo-1564501049412-61c2a3083791",
  },
  {
    agencyKey: "global-getaways", slug: "bhutan-cultural-journey", name: "Bhutan Monasteries & Valley Journey",
    destination: "Paro & Thimphu, Bhutan", places: [{ city: "Paro", country: "Bhutan" }, { city: "Thimphu", country: "Bhutan" }],
    geographicScope: "regional", tripTheme: "leisure", durationDays: 6, price: 99999, startInDays: 275, imagePhoto: "photo-1544735716-392fe2489ffa",
  },
  {
    agencyKey: "kerala-coast", slug: "kochi-budget-weekender", name: "Kochi Heritage Budget Weekender",
    destination: "Kochi, Kerala, India", places: [{ city: "Kochi", state: "Kerala", country: "India" }, { city: "Fort Kochi", state: "Kerala", country: "India" }],
    geographicScope: "domestic", tripTheme: "weekend", durationDays: 2, price: 8999, startInDays: 20, imagePhoto: "photo-1513622470522-26c3c8a854bc",
  },
  {
    agencyKey: "himalayan-horizon", slug: "ladakh-grand-traverse", name: "Ladakh Grand Traverse",
    destination: "Leh, Nubra & Pangong, India", places: [{ city: "Leh", state: "Ladakh", country: "India" }, { city: "Nubra Valley", state: "Ladakh", country: "India" }, { city: "Pangong Tso", state: "Ladakh", country: "India" }],
    geographicScope: "domestic", tripTheme: "adventure", durationDays: 12, price: 119999, startInDays: 205, isFeatured: true, imagePhoto: "photo-1464822759023-fed622ff2c3b",
  },
  {
    agencyKey: "wanderlust-goa", slug: "goa-monsoon-saver", name: "Goa Monsoon Saver",
    destination: "Goa, India", places: [{ city: "Panaji", state: "Goa", country: "India" }, { city: "Candolim", state: "Goa", country: "India" }],
    geographicScope: "domestic", tripTheme: "leisure", durationDays: 4, price: 10999, startInDays: 50, status: "sold_out", imagePhoto: "photo-1512343879784-a960bf40e7f2",
  },
  {
    agencyKey: "kerala-coast", slug: "kerala-wellness-retreat", name: "Kerala Ayurveda Wellness Retreat",
    destination: "Kovalam, Kerala, India", places: [{ city: "Kovalam", state: "Kerala", country: "India" }, { city: "Kochi", state: "Kerala", country: "India" }],
    geographicScope: "domestic", tripTheme: "leisure", durationDays: 7, price: 79999, startInDays: 130, status: "sold_out", imagePhoto: "photo-1602216056096-3b40cc0c9944",
  },
  {
    agencyKey: "royal-rajasthan", slug: "rajasthan-historic-train", name: "Rajasthan Heritage Rail Preview",
    destination: "Jaipur, Rajasthan, India", places: [{ city: "Jaipur", state: "Rajasthan", country: "India" }],
    geographicScope: "domestic", tripTheme: "leisure", durationDays: 4, price: 49999, startInDays: 45, status: "draft", visibility: "private", imagePhoto: "photo-1477587458883-47145ed94245",
  },
  {
    agencyKey: "global-getaways", slug: "tokyo-spring-planner", name: "Tokyo Spring Planner",
    destination: "Tokyo, Japan", places: [{ city: "Tokyo", country: "Japan" }],
    geographicScope: "international", tripTheme: "custom", durationDays: 8, price: 179999, startInDays: 220, status: "draft", visibility: "private", imagePhoto: "photo-1493976040374-85c8e12f0c0e",
  },
  {
    agencyKey: "himalayan-horizon", slug: "old-manali-winter-escape", name: "Old Manali Winter Escape",
    destination: "Manali, Himachal Pradesh, India", places: [{ city: "Manali", state: "Himachal Pradesh", country: "India" }],
    geographicScope: "domestic", tripTheme: "weekend", durationDays: 3, price: 18999, startInDays: -35, status: "completed", visibility: "private", imagePhoto: "photo-1519681393784-d120267933ba",
  },
];

function dateAtOffset(days: number): Date {
  const today = new Date();
  const startOfToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return new Date(startOfToday + days * DAY_IN_MS);
}

function imageUrl(photoId: string, width: number): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=85`;
}

function createItinerary(destination: string, durationDays: number) {
  return Array.from({ length: durationDays }, (_, index) => ({
    day: index + 1,
    title: index === 0 ? "Arrival & welcome" : index === durationDays - 1 ? "Last sights & departure" : `Explore ${destination}`,
    description:
      index === 0
        ? `Meet your local coordinator, settle in and get an introduction to ${destination}.`
        : index === durationDays - 1
          ? "Enjoy breakfast, check out and transfer onward with time for your departure."
          : `Discover local highlights, enjoy a guided experience and have time to explore ${destination} at your own pace.`,
    meals: index === 0 ? ["Dinner"] : index === durationDays - 1 ? ["Breakfast"] : ["Breakfast"],
    accommodation: index === durationDays - 1 ? undefined : "Handpicked 3-star hotel or locally hosted stay",
  }));
}

async function seedTravelData(): Promise<void> {
  await connectDatabase();
  await RoleService.seedDefaults();

  // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
  const agencyRole = await Role.findOne({ key: "agency" }).exec();
  if (!agencyRole) {
    throw new Error("The agency role was not available after seeding default roles.");
  }

  const agencyIds = new Map<string, { agencyId: string; ownerUserId: string }>();
  const passwordHash = await bcrypt.hash(DEMO_AGENCY_PASSWORD, BCRYPT_SALT_ROUNDS);

  for (const agency of agencies) {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const owner = await User.findOneAndUpdate(
      { email: agency.ownerEmail },
      {
        $set: {
          roleId: agencyRole._id,
          name: agency.ownerName,
          email: agency.ownerEmail,
          passwordHash,
          status: "active",
          emailVerified: true,
          authProvider: "email_password",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();

    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const savedAgency = await Agency.findOneAndUpdate(
      { slug: agency.slug },
      {
        $set: {
          ownerUserId: owner._id,
          name: agency.name,
          slug: agency.slug,
          logo: {
            url: imageUrl(agency.logoPhoto, 256),
            altText: `${agency.name} logo`,
          },
          about: agency.about,
          yearEstablished: agency.yearEstablished,
          location: {
            country: "India",
            state: agency.state,
            city: agency.city,
          },
          contact: {
            phone: agency.phone,
            email: `hello@${agency.slug}.example`,
            website: `https://${agency.slug}.example`,
          },
          services: agency.services,
          status: "approved",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    ).exec();

    agencyIds.set(agency.key, {
      agencyId: String(savedAgency._id),
      ownerUserId: String(owner._id),
    });
  }

  for (const [index, item] of packages.entries()) {
    const agency = agencyIds.get(item.agencyKey);
    if (!agency) {
      throw new Error(`No seeded agency found for package "${item.slug}".`);
    }

    const startDate = dateAtOffset(item.startInDays);
    const endDate = dateAtOffset(item.startInDays + item.durationDays - 1);
    const bookingDeadline = dateAtOffset(item.startInDays - 7);
    const status = item.status ?? "active";
    const visibility = item.visibility ?? "public";
    const photoUrl = imageUrl(item.imagePhoto, 1200);

    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    await Package.findOneAndUpdate(
      { slug: item.slug },
      {
        $set: {
          agencyId: agency.agencyId,
          ownerUserId: agency.ownerUserId,
          name: item.name,
          slug: item.slug,
          description: `${item.name} is a ${item.durationDays}-day ${item.tripTheme} holiday in ${item.destination}. Travel with experienced local partners, a well-paced itinerary and clear pricing.`,
          destination: item.destination,
          destinations: item.places.map((place, placeIndex) => ({
            ...place,
            days: Math.floor(item.durationDays / item.places.length) + (placeIndex < item.durationDays % item.places.length ? 1 : 0),
          })),
          geographicScope: item.geographicScope,
          tripTheme: item.tripTheme,
          durationDays: item.durationDays,
          durationNights: item.durationDays - 1,
          startDate,
          endDate,
          bookingDeadline,
          price: item.price,
          currency: "INR",
          priceType: "per_person",
          minTravelers: 1,
          maxTravelers: item.tripTheme === "corporate" ? 24 : 10,
          availableSeats: status === "sold_out" ? 0 : item.tripTheme === "corporate" ? 24 : 12 + (index % 9),
          childPolicy: "Children are welcome; child pricing is confirmed at enquiry based on age and room sharing.",
          infantPolicy: "Infants under 2 may travel with an accompanying adult; transport and accommodation terms apply.",
          taxType: "inclusive",
          advancePercentage: 25,
          balanceDueDays: 7,
          priceValidUntil: bookingDeadline,
          inclusions: [
            `${item.durationDays - 1} nights in selected accommodation`,
            "Daily breakfast",
            "Airport or station transfers listed in the itinerary",
            "Local English-speaking guide for scheduled activities",
            "All listed sightseeing and applicable entry fees",
          ],
          exclusions: [
            "Flights or train tickets unless specifically listed",
            "Personal expenses and meals not mentioned",
            "Travel insurance and optional activities",
          ],
          itinerary: createItinerary(item.destination, item.durationDays),
          images: [{
            url: photoUrl,
            key: `demo-packages/${item.slug}/cover`,
            altText: `${item.name} - ${item.destination}`,
            isPrimary: true,
            order: 0,
            createdAt: new Date(),
          }],
          highlights: [
            `Explore ${item.destination}`,
            `${item.durationDays} days / ${item.durationDays - 1} nights`,
            item.tripTheme === "adventure" ? "Small-group guided experiences" : "A carefully paced local itinerary",
          ],
          termsAndConditions: "Prices are per person in INR based on twin sharing. Availability and final confirmation are subject to supplier reconfirmation.",
          cancellationPolicy: "Cancel at least 30 days before departure for a full refund of the package amount less any non-refundable supplier charges. Cancellation fees increase closer to departure.",
          status,
          visibility,
          isFeatured: item.isFeatured ?? false,
          meta: {
            views: 180 + index * 47,
            inquiries: 12 + index * 3,
            bookings: status === "sold_out" ? 12 : index % 8,
          },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    ).exec();
  }

  const publicPackageCount = packages.filter((item) => (item.visibility ?? "public") === "public").length;
  process.stdout.write(`Seeded ${agencies.length} demo agencies and ${packages.length} packages (${publicPackageCount} public).\n`);
  process.stdout.write("Run this command again safely to refresh the same demo records; unrelated collections are not removed.\n");
}

seedTravelData()
  .catch((error: unknown) => {
    console.error("Failed to seed travel demo data.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
