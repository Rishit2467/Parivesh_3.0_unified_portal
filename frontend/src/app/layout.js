import "../styles/globals.css";

export const metadata = {
  title: "PARIVESH 3.0 — Unified Environmental Clearance Portal",
  description:
    "A unified portal for managing the complete lifecycle of Environmental Clearance applications.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Tricolor bar at the very top */}
        <div className="tricolor-bar" />
        {children}
      </body>
    </html>
  );
}
