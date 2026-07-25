import React from "react";

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
  style?: React.CSSProperties;
}

export const Skeleton = ({ width = "100%", height = "16px", className = "", rounded, style }: SkeletonProps) => (
  <div
    className={`skeleton ${rounded ? "rounded-full" : ""} ${className}`}
    style={{ width, height, ...style }}
    aria-hidden="true"
  />
);

export const RestaurantCardSkeleton = () => (
  <div className="card overflow-hidden">
    <Skeleton height="180px" className="rounded-none" />
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <Skeleton height="20px" width="75%" />
      <Skeleton height="14px" width="50%" />
      <Skeleton height="14px" width="40%" />
    </div>
  </div>
);

export const MenuItemSkeleton = () => (
  <div style={{ display: "flex", gap: "16px", padding: "16px", borderBottom: "1px solid var(--color-border)" }}>
    <Skeleton width="80px" height="80px" className="rounded-lg" style={{ flexShrink: 0 }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
      <Skeleton height="18px" width="60%" />
      <Skeleton height="14px" width="90%" />
      <Skeleton height="14px" width="30%" />
    </div>
  </div>
);

export const OrderCardSkeleton = () => (
  <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Skeleton height="18px" width="40%" />
      <Skeleton height="18px" width="20%" />
    </div>
    <Skeleton height="14px" width="70%" />
    <Skeleton height="14px" width="50%" />
  </div>
);

export default Skeleton;
