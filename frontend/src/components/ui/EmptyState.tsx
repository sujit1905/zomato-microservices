import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({ icon = "🍽️", title, description, action }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        textAlign: "center",
        gap: "16px",
      }}
    >
      <div style={{ fontSize: "64px", lineHeight: 1, marginBottom: "8px" }}>{icon}</div>
      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)", maxWidth: "320px", margin: 0 }}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary"
          style={{ marginTop: "8px" }}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
