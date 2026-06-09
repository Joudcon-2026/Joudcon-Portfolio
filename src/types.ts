export interface Album {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  tag: string; // e.g., 'Corporate', 'Exhibition'
  date: string;
}

export interface PortfolioPhoto {
  id: string;
  url: string;
  title: string;
  category: string; // e.g. "Stage", "3D Logo", etc.
  albumId: string | null; // linked album id
  createdAt: string;
  isWatermarked?: boolean; // tracks if custom watermark has been applied
}

export const CATEGORIES = [
  "Stage",
  "3D Logo",
  "Flags",
  "Registration Desk",
  "AV Systems",
  "Photo Booth",
  "Exhibition Booths & Trophies",
  "Gift items",
  "Certificates",
  "Cubes & Lama Stand",
  "Backdrops",
  "Games and activities",
  "Kids corner",
  "Furniture Rental",
  "Tent Rental",
  "Catering services",
  "Technology Rental",
  "Branding and Printing",
  "Vehicle Branding",
  "Design services"
] as const;

export type CategoryType = typeof CATEGORIES[number];
