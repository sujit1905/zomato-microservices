import { BiGlobe } from "react-icons/bi";

const Footer = () => {
  return (
    <footer style={{ background: "#F8F8F8", borderTop: "1px solid var(--color-border)", padding: "48px 0 32px", fontFamily: "var(--font-sans)" }}>
      <div className="container">
        
        {/* Top brand header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "40px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 850, color: "var(--color-primary)", letterSpacing: "-1.5px", margin: 0, textTransform: "lowercase" }}>
              zomato
            </h2>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#fff", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "0.875rem", cursor: "pointer" }}>
              <BiGlobe size={16} /> India
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#fff", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "0.875rem", cursor: "pointer" }}>
              🌐 English
            </div>
          </div>
        </div>

        {/* Links grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "32px", marginBottom: "48px" }}>
          <div>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--color-dark)", marginBottom: "16px" }}>About Zomato</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.875rem" }}>
              {["Who We Are", "Blog", "Work With Us", "Investor Relations", "Report Fraud", "Contact Us"].map(item => (
                <li key={item}><span style={{ color: "var(--color-text-muted)", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-muted)"}>{item}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--color-dark)", marginBottom: "16px" }}>Zomaverse</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.875rem" }}>
              {["Zomato", "Blinkit", "Feeding India", "Hyperpure", "Zomaland"].map(item => (
                <li key={item}><span style={{ color: "var(--color-text-muted)", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-muted)"}>{item}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--color-dark)", marginBottom: "16px" }}>For Restaurants</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.875rem" }}>
              {["Partner With Us", "Apps For You"].map(item => (
                <li key={item}><span style={{ color: "var(--color-text-muted)", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-muted)"}>{item}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--color-dark)", marginBottom: "16px" }}>Learn More</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.875rem" }}>
              {["Privacy", "Security", "Terms", "Sitemap"].map(item => (
                <li key={item}><span style={{ color: "var(--color-text-muted)", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-muted)"}>{item}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Separator line */}
        <div style={{ height: "1px", background: "var(--color-border)", marginBottom: "24px" }} />

        {/* Disclaimer */}
        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-light)", lineHeight: 1.6, margin: 0 }}>
          By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners. © 2008-2026 Zomato™ Ltd. All rights reserved.
        </p>

      </div>
    </footer>
  );
};

export default Footer;
