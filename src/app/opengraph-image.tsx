import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "DistroHub: справочник по дистрибутивам Linux";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f3efe6",
          color: "#1d1a16",
          padding: "54px 64px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid #1d1a16",
            paddingBottom: "18px",
            fontFamily: "monospace",
            fontSize: "16px",
            letterSpacing: "2px",
            color: "#6d6558",
          }}
        >
          <span>DISTROHUB / СПРАВОЧНИК</span>
          <span>ВЫПУСК 01 · 2026</span>
        </div>

        <div style={{ display: "flex", flex: 1, gap: "60px", paddingTop: "42px" }}>
          <div style={{ display: "flex", flexDirection: "column", width: "650px" }}>
            <div
              style={{
                display: "flex",
                fontFamily: "monospace",
                fontSize: "17px",
                letterSpacing: "2px",
                color: "#b54622",
              }}
            >
              ПОЛЕВОЙ СПРАВОЧНИК ПО LINUX
            </div>
            <div
              style={{
                display: "flex",
                marginTop: "20px",
                fontSize: "78px",
                lineHeight: 0.98,
                letterSpacing: "-2.5px",
              }}
            >
              Выбрать систему без чужих ошибок.
            </div>
            <div
              style={{
                display: "flex",
                marginTop: "24px",
                maxWidth: "560px",
                fontFamily: "sans-serif",
                fontSize: "22px",
                lineHeight: 1.5,
                color: "#403a31",
              }}
            >
              Двадцать дистрибутивов, честные требования к железу и пять вопросов
              вместо вечера на форумах.
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
              {["20 систем", "5 вопросов", "3 варианта"].map((label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    border: "1px solid #b5a793",
                    padding: "7px 12px",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "#6d6558",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              border: "2px solid #1d1a16",
              background: "#fbf8f1",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #1d1a16",
                padding: "12px 16px",
                fontFamily: "monospace",
                fontSize: "13px",
                letterSpacing: "1px",
                color: "#6d6558",
              }}
            >
              <span>КОРОТКИЙ СПИСОК</span>
              <span>01 / 03</span>
            </div>
            {[
              ["Ubuntu", "новичкам", "DEB · LTS"],
              ["Linux Mint", "после Windows", "DEB · LTS"],
              ["Fedora", "свежее железо", "RPM · 13 мес."],
            ].map((row, index) => (
              <div
                key={row[0]}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderBottom: index < 2 ? "1px solid #d6ccbc" : "none",
                  padding: "18px 16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <span style={{ fontSize: "26px" }}>{row[0]}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#6d6558" }}>
                    {row[2]}
                  </span>
                </div>
                <span
                  style={{
                    marginTop: "4px",
                    fontFamily: "sans-serif",
                    fontSize: "15px",
                    color: "#6d6558",
                  }}
                >
                  {row[1]}
                </span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                marginTop: "auto",
                borderTop: "1px solid #1d1a16",
                padding: "12px 16px",
                fontFamily: "monospace",
                fontSize: "12px",
                letterSpacing: "1px",
                color: "#b54622",
              }}
            >
              DISTROHUB.LOCAL
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
