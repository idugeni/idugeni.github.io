import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/**
 * Generates a dynamic OG image with title and description.
 * Reusable across all routes.
 */
export function generateOgImage({
  title,
  description,
  type,
}: {
  title: string;
  description?: string;
  type?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(6,182,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Border */}
        <div
          style={{
            position: "absolute",
            inset: "2px",
            border: "1px solid rgba(6,182,212,0.3)",
          }}
        />

        {/* Top: Brand + Type badge */}
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 80,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#06b6d4",
              letterSpacing: "0.1em",
            }}
          >
            IRNK
          </div>
          {type && (
            <div
              style={{
                fontSize: 14,
                color: "#06b6d4",
                border: "1px solid rgba(6,182,212,0.4)",
                padding: "4px 12px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              {type}
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 40 ? 44 : 56,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.2,
            marginBottom: description ? 16 : 0,
            maxWidth: "90%",
          }}
        >
          {title}
        </div>

        {/* Description */}
        {description && (
          <div
            style={{
              fontSize: 22,
              color: "#a1a1aa",
              lineHeight: 1.5,
              maxWidth: "80%",
            }}
          >
            {description.length > 120
              ? description.substring(0, 120) + "..."
              : description}
          </div>
        )}

        {/* Bottom: URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 60,
            fontSize: 18,
            color: "#06b6d4",
            opacity: 0.7,
          }}
        >
          irnk.codes
        </div>
      </div>
    ),
    { ...ogSize }
  );
}
