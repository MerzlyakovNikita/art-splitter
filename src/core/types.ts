export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Gallery = {
  id: string;
  name: string;
  images: string[];
  path: string;
};

export type ProcessedImage = {
  processedSrc: string;
  originalSrc: string;
  metric: number;
  luminance: number;
  variance: number;
  title: string;
  author: string;
  year: string;
  features: FeatureVector;
};

export type ProcessedGallery = {
  id: string;
  name: string;
  depth: number;
  kL: number;
  kV: number;
  images: ProcessedImage[];
  tree: TreeStep[];
  order: number[];
  createdAt: number;
};

export type FeatureVector = {
  dark: number;
  detailed: number;
  warm: number;
  greenDominant: number;
  monochrome: number;
};

export type TreeStep = {
  classItems: number[];
  similarity: number;
  addedIndex: number | null;
};
