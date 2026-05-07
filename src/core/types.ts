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
};

export type ProcessedGallery = {
  id: string;
  name: string;
  depth: number;

  images: ProcessedImage[];

  createdAt: number;
};
