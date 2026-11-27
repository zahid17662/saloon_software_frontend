// The public price list, in whole taka, copied from the parlour's printed menu.
// It is separate from the POS menu in the database: change prices in both places.

export type CategoryId = "hair" | "color" | "facial" | "treat" | "chair";

export interface Service {
  id: number;
  cat: CategoryId;
  name: string;
  price: number;
  tag?: string;
  popular?: boolean;
}

export const CATEGORIES: { id: CategoryId; name: string; blurb: string }[] = [
  { id: "hair", name: "Hair Cutting", blurb: "Cut, wash, beard & setup" },
  { id: "color", name: "Hair Color", blurb: "Colour, shine & highlights" },
  { id: "facial", name: "Facial", blurb: "Gold, Diamond & Hydra" },
  { id: "treat", name: "Hair Treatment", blurb: "Spa, straightening & rebonding" },
  { id: "chair", name: "Massage Chair", blurb: "10 to 60 minute sessions" },
];

export const SERVICES: Service[] = [
  { id: 1, cat: "hair", name: "Hair Cutting", price: 150, tag: "Popular", popular: true },
  { id: 2, cat: "hair", name: "Hair Wash", price: 50 },
  { id: 3, cat: "hair", name: "Beard Trimming", price: 100, tag: "Popular", popular: true },
  { id: 4, cat: "hair", name: "Hair Setup", price: 100 },
  { id: 5, cat: "color", name: "Hair Shining", price: 400 },
  { id: 6, cat: "color", name: "Hair Color Black (Revlon)", price: 600, tag: "Popular", popular: true },
  { id: 7, cat: "color", name: "Hair Color Brown", price: 600 },
  { id: 8, cat: "color", name: "Hair Color Beige", price: 600 },
  { id: 9, cat: "color", name: "Hair Highlight Color (per step)", price: 200 },
  { id: 10, cat: "facial", name: "Brightening Facial", price: 300 },
  { id: 11, cat: "facial", name: "Gold Facial", price: 600, tag: "Popular", popular: true },
  { id: 12, cat: "facial", name: "Diamond Facial", price: 700 },
  { id: 13, cat: "facial", name: "Silver Facial", price: 600 },
  { id: 14, cat: "facial", name: "Acne Facial", price: 600 },
  { id: 15, cat: "facial", name: "Fruit Facial", price: 600 },
  { id: 16, cat: "facial", name: "Hydra Facial (Mini)", price: 1200 },
  { id: 17, cat: "facial", name: "Hydra Facial (Full)", price: 1800, tag: "Premium", popular: true },
  { id: 18, cat: "treat", name: "Hair Treatment", price: 600 },
  { id: 19, cat: "treat", name: "Hair Spa", price: 600, tag: "Popular", popular: true },
  { id: 20, cat: "treat", name: "Hair Straightening", price: 2000 },
  { id: 21, cat: "treat", name: "Hair Rebonding", price: 2500, tag: "Premium", popular: true },
  { id: 22, cat: "chair", name: "Massage Chair — 10 Minutes", price: 100 },
  { id: 23, cat: "chair", name: "Massage Chair — 20 Minutes", price: 200 },
  { id: 24, cat: "chair", name: "Massage Chair — 30 Minutes", price: 250, tag: "Best Value", popular: true },
  { id: 25, cat: "chair", name: "Massage Chair — 60 Minutes", price: 400 },
];

export const COMBO_IDS = [1, 2, 3, 4];

export const taka = (n: number) => `৳${n.toLocaleString("en-IN")}`;
