import styles from "./TreeDiagram.module.css";
import { useState } from "react";
import type { TreeStep, FeatureVector } from "../../core/types";

type Props = {
  tree: TreeStep[];
  images: {
    src: string;
    title?: string;
    features?: FeatureVector;
  }[];
};

export default function TreeGraph({ tree, images }: Props) {
  if (tree.length === 0) {
    return null;
  }
  const [hovered, setHovered] = useState<number | null>(null);

  const width = 1150;
  const height = 650;

  const bottomY = 560;
  const leftX = 90;
  const topY = 60;

  const usableHeight = bottomY - topY;

  const stepSpacing = 64;

  const maxSimilarity = Math.max(...tree.map((s) => s.similarity));

  function getY(similarity: number) {
    const normalized = similarity / maxSimilarity;

    return topY + normalized * usableHeight;
  }

  return (
    <div className={styles.wrapper}>
      <svg width={width} height={height} className={styles.svg}>
        <line
          x1={leftX}
          y1={topY}
          x2={leftX}
          y2={bottomY}
          stroke="#64748b"
          strokeWidth="2"
        />

        {[1, 0.8, 0.6, 0.4, 0.2, 0].map((v) => {
          const y = topY + v * usableHeight;

          return (
            <g key={v}>
              <text x={25} y={y + 5} fill="#cbd5e1" fontSize="13">
                {v.toFixed(1)}
              </text>

              <line x1={leftX - 8} y1={y} x2={leftX} y2={y} stroke="#64748b" />
            </g>
          );
        })}

        {images.map((img, index) => {
          const x = leftX + 70 + index * stepSpacing;

          return (
            <g key={index}>
              <rect
                x={x - 4}
                y={bottomY - 4}
                width="8"
                height="8"
                fill="#ef4444"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  cursor: "pointer",
                }}
              />

              <text x={x - 24} y={bottomY + 22} fill="#60a5fa" fontSize="10">
                {img.features
                  ? `(${Object.values(img.features).join(" ")})`
                  : ""}
              </text>
            </g>
          );
        })}

        {tree.map((step, index) => {
          const x = leftX + 70 + (index + 1) * stepSpacing;

          const y = getY(step.similarity);

          const prevX = leftX + 70 + index * stepSpacing;

          const prevY =
            index === 0 ? bottomY : getY(tree[index - 1].similarity);

          return (
            <g key={index}>
              <line
                x1={x}
                y1={bottomY}
                x2={x}
                y2={y}
                stroke="#94a3b8"
                strokeWidth="2"
              />

              <line
                x1={prevX}
                y1={prevY}
                x2={x}
                y2={prevY}
                stroke="#94a3b8"
                strokeWidth="2"
              />

              <g>
                <rect
                  x={x - 22}
                  y={y - 26 - index * 2}
                  width="52"
                  height="18"
                  fill="#081028"
                />

                <text
                  x={x - 16}
                  y={y - 14 - index * 2}
                  fill="#e2e8f0"
                  fontSize="12"
                >
                  {step.similarity.toFixed(4)}
                </text>
              </g>
            </g>
          );
        })}
        {hovered !== null &&
          images[hovered] &&
          (() => {
            const x = leftX + 70 + hovered * stepSpacing;

            return (
              <g>
                <rect
                  x={x - 70}
                  y={bottomY - 170}
                  width="140"
                  height="160"
                  fill="#081028"
                  stroke="#334155"
                  rx="8"
                />

                <image
                  href={images[hovered].src}
                  x={x - 60}
                  y={bottomY - 160}
                  width="120"
                  height="100"
                />

                <foreignObject
                  x={x - 60}
                  y={bottomY - 50}
                  width="120"
                  height="40"
                >
                  <div
                    style={{
                      color: "white",
                      fontSize: "10px",
                      textAlign: "center",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {images[hovered].title}
                  </div>
                </foreignObject>
              </g>
            );
          })()}
      </svg>
    </div>
  );
}
