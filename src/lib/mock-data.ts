export type FoodCategory = "Produce" | "Bakery" | "Prepared Meals" | "Dairy" | "Other";

export interface FoodItem {
  id: string;
  donorId: string;
  donorName: string;
  itemName: string;
  category: FoodCategory;
  quantityKg: number;
  safeToConsumeUntil: string;
  status: "Available" | "Claimed" | "In Transit" | "Delivered";
}

export interface ImpactData {
  totalDonatedKg: number;
  co2SavedKg: number;
  taxWriteOffValue: number;
}

export interface SOSAppeal {
  id: string;
  ngoId: string;
  ngoName: string;
  requestText: string;
  urgency: "High" | "Medium" | "Low";
  datePosted: string;
}

export interface Claim {
  id: string;
  foodItemId: string;
  ngoId: string;
  status: "Pending" | "In Transit" | "Received";
  claimedAt: string;
}

export const MOCK_IMPACT: ImpactData = {
  totalDonatedKg: 1250,
  co2SavedKg: 3125, 
  taxWriteOffValue: 4500,
};

export const MOCK_ACTIVE_DONATIONS: FoodItem[] = [
  {
    id: "f1",
    donorId: "biz1",
    donorName: "Fresh Market Banquets",
    itemName: "Assorted Sandwiches & Wraps",
    category: "Prepared Meals",
    quantityKg: 15,
    safeToConsumeUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: "Available",
  },
  {
    id: "f2",
    donorId: "biz2",
    donorName: "Campus Mess Hall",
    itemName: "Steamed Rice and Veg Curry",
    category: "Prepared Meals",
    quantityKg: 40,
    safeToConsumeUntil: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    status: "Available",
  },
  {
    id: "f3",
    donorId: "biz1",
    donorName: "Fresh Market Banquets",
    itemName: "Surplus Bread & Pastries",
    category: "Bakery",
    quantityKg: 10,
    safeToConsumeUntil: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: "Available",
  },
];

export const MOCK_SOS_APPEALS: SOSAppeal[] = [
  {
    id: "sos1",
    ngoId: "ngo1",
    ngoName: "City Hope Shelter",
    requestText: "Need 20kg of staple food (Rice/Wheat) by tomorrow for our weekend drive.",
    urgency: "High",
    datePosted: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sos2",
    ngoId: "ngo2",
    ngoName: "Grace Orphanage",
    requestText: "Looking for fresh fruits or dairy before the weekend.",
    urgency: "Medium",
    datePosted: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_CLAIMS: Claim[] = [
  {
    id: "c1",
    foodItemId: "f4",
    ngoId: "ngo1",
    status: "In Transit",
    claimedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c2",
    foodItemId: "f5",
    ngoId: "ngo1",
    status: "Received",
    claimedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ── Vendor Map ──────────────────────────────────────────────

export interface Vendor {
  id: string;
  name: string;
  lat: number;
  lng: number;
  activeItems: number;
  distance: string;
  category: string;
}

export const MOCK_VENDORS: Vendor[] = [
  { id: "v1", name: "Fresh Market Banquets", lat: 28.6139, lng: 77.2090, activeItems: 3, distance: "1.2 km", category: "Banquet Hall" },
  { id: "v2", name: "Campus Mess Hall", lat: 28.6200, lng: 77.2150, activeItems: 1, distance: "2.5 km", category: "Cafeteria" },
  { id: "v3", name: "Green Leaf Bakery", lat: 28.6080, lng: 77.2000, activeItems: 5, distance: "0.8 km", category: "Bakery" },
  { id: "v4", name: "Sunrise Dairy Farm", lat: 28.6250, lng: 77.2250, activeItems: 2, distance: "3.1 km", category: "Dairy" },
  { id: "v5", name: "Royal Catering Co.", lat: 28.6100, lng: 77.2300, activeItems: 4, distance: "4.0 km", category: "Catering" },
  { id: "v6", name: "Harvest Kitchen", lat: 28.6180, lng: 77.1950, activeItems: 2, distance: "1.8 km", category: "Restaurant" },
];

// ── Org Team Manager ────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Coordinator" | "Volunteer" | "Driver";
  joinedAt: string;
  avatar?: string;
}

export const MOCK_ORG_TEAM: TeamMember[] = [
  { id: "t1", name: "Anika Sharma", email: "anika@cityhope.org", role: "Admin", joinedAt: "2025-01-15T10:00:00Z" },
  { id: "t2", name: "Rahul Verma", email: "rahul@cityhope.org", role: "Coordinator", joinedAt: "2025-03-22T09:00:00Z" },
  { id: "t3", name: "Priya Nair", email: "priya@cityhope.org", role: "Volunteer", joinedAt: "2025-06-10T14:00:00Z" },
  { id: "t4", name: "Deepak Joshi", email: "deepak@cityhope.org", role: "Driver", joinedAt: "2025-09-01T08:00:00Z" },
];

// ── Live Receiver Alerts ────────────────────────────────────

export const MOCK_ALERT_POOL: string[] = [
  "🍚 Banquet Hall A just posted 5kg of Rice — 1.2 km away",
  "⏰ Expiring Soon: Bread from Green Leaf Bakery — 2 km away",
  "🥗 Campus Mess has 40 portions of Veg Curry — Claim now!",
  "🧀 Sunrise Dairy listed 8kg of Paneer — expires in 6h",
  "🎂 Royal Catering posted 15 boxes of Pastries — 4 km away",
  "🚨 Urgent: 20kg of Cooked Rice expiring in 3 hours — 0.8 km",
  "🥛 Fresh milk batch available from Sunrise Dairy — 3.1 km",
  "🍞 100 Roti packs from Harvest Kitchen — available now",
  "📦 New bulk listing: 25kg Mixed Vegetables — 1.8 km away",
  "🔔 Green Leaf Bakery restocked 12kg of Bread — grab fast!",
];

// ── Expanded Inventory (for countdown demos) ────────────────

export const MOCK_INVENTORY: FoodItem[] = [
  {
    id: "inv1",
    donorId: "biz1",
    donorName: "Your Business",
    itemName: "Steamed Rice",
    category: "Prepared Meals",
    quantityKg: 25,
    safeToConsumeUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: "Available",
  },
  {
    id: "inv2",
    donorId: "biz1",
    donorName: "Your Business",
    itemName: "Whole Wheat Bread Loaves",
    category: "Bakery",
    quantityKg: 8,
    safeToConsumeUntil: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    status: "Available",
  },
  {
    id: "inv3",
    donorId: "biz1",
    donorName: "Your Business",
    itemName: "Mixed Fruit Platter",
    category: "Produce",
    quantityKg: 12,
    safeToConsumeUntil: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    status: "Available",
  },
  {
    id: "inv4",
    donorId: "biz1",
    donorName: "Your Business",
    itemName: "Paneer Tikka (Catering Surplus)",
    category: "Prepared Meals",
    quantityKg: 6,
    safeToConsumeUntil: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: "Available",
  },
  {
    id: "inv5",
    donorId: "biz1",
    donorName: "Your Business",
    itemName: "Curd & Yogurt Cups",
    category: "Dairy",
    quantityKg: 15,
    safeToConsumeUntil: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    status: "Available",
  },
  {
    id: "inv6",
    donorId: "biz1",
    donorName: "Your Business",
    itemName: "Dal Makhani (Bulk)",
    category: "Prepared Meals",
    quantityKg: 20,
    safeToConsumeUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: "Available",
  },
];
