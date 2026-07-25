type BadgeVariant = "success" | "warning" | "error" | "info" | "muted" | "primary";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const Badge = ({ variant = "muted", children, dot, className = "" }: BadgeProps) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {dot && <span className={`status-dot status-dot-${variant === "success" ? "green" : variant === "error" ? "red" : "yellow"}`} />}
      {children}
    </span>
  );
};

export default Badge;
