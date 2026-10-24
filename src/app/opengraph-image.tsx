import { ImageResponse } from "next/og";

export const alt = "PR Production — Wedding Photography & Cinematic Films";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social sharing image (typographic, no stock photography). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "80px", background: "radial-gradient(ellipse at 75% 25%, #2a2118 0%, #080808 60%)", color: "#F5F0E8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, border: "2px solid #C5A572", color: "#C5A572", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, letterSpacing: 2 }}>PR</div>
          <div style={{ fontSize: 30, letterSpacing: 8, textTransform: "uppercase", color: "#C5A572" }}>PR Production</div>
        </div>
        <div style={{ fontSize: 84, lineHeight: 1.05, marginTop: 48, maxWidth: 950 }}>Every Love Story Deserves To Be Remembered.</div>
        <div style={{ fontSize: 26, marginTop: 36, color: "#B5B5B5", letterSpacing: 4 }}>CHHATTISGARH • MAHARASHTRA • ODISHA • ACROSS INDIA</div>
      </div>
    ),
    size,
  );
}
