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
};

export type ProcessedGallery = {
  id: string;
  name: string;
  depth: number;
  kL: number;
  kV: number;
  images: ProcessedImage[];
  createdAt: number;
};
