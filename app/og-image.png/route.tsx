import { ImageResponse } from "next/og";
import { OG_IMAGE, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

// Built once at build time; the text follows the brand constant in lib/site.ts.
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #004a99 0%, #0b6bd3 100%)",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -1 }}>{SITE_NAME}</div>
        <div style={{ marginTop: 28, fontSize: 40, lineHeight: 1.3, maxWidth: 980, opacity: 0.92 }}>
          {SITE_TAGLINE}
        </div>
        <div style={{ marginTop: 56, display: "flex", gap: 20, fontSize: 28 }}>
          {["Brand", "SEO", "AI/Entity", "Trust", "Value"].map((s) => (
            <div
              key={s}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                border: "2px solid rgba(255,255,255,0.6)",
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: OG_IMAGE.width, height: OG_IMAGE.height }
  );
}
