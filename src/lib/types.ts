export type PackageManager = "deb" | "rpm" | "pacman" | "apk" | "other";
export type ReleaseModel = "lts" | "fixed" | "rolling" | "immutable";
export type Purpose =
  | "beginners"
  | "switchers"
  | "servers"
  | "lightweight"
  | "old-pc"
  | "dev"
  | "gaming"
  | "privacy"
  | "security"
  | "containers";

export type Panel = "top" | "bottom" | "none";
export type WindowKind = "files" | "terminal" | "settings" | "store";
export type Wallpaper = "aurora" | "grid" | "waves" | "dots" | "plain" | "orbit";

export interface DistroPreview {
  from: string;
  to: string;
  wallpaper: Wallpaper;
  panel: Panel;
  window: WindowKind;
}

export interface Distro {
  slug: string;
  name: string;
  logo: string;
  accent: string;
  tagline: string;
  summary: string;
  description: string[];
  basedOn: string;
  packageManager: PackageManager;
  releaseModel: ReleaseModel;
  desktops: string[];
  purposes: Purpose[];
  minRam: number;
  recRam: number;
  disk: number;
  architectures: string[];
  version: string;
  isoSize: string;
  website: string;
  downloadUrl: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  notFor: string;
  featured: boolean;
  popularity: number;
  since: number;
  preview: DistroPreview;
}

export interface Review {
  id: number;
  distro: string;
  userId: number;
  author: string;
  rating: number;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  mine?: Review | null;
}

export interface PublicReview {
  id: number;
  author: string;
  rating: number;
  body: string;
  createdAt: number;
  updatedAt: number;
  mine: boolean;
}

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  createdAt: number;
}

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  steps?: string[];
  code?: { lang: string; content: string };
  callout?: { tone: "info" | "warning" | "tip"; text: string };
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: "install" | "basics" | "hardware" | "desktop";
  readingTime: number;
  updated: string;
  sections: GuideSection[];
}
