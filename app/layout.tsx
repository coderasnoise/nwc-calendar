import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medical Calendar MVP",
  description: "Single doctor scheduling MVP"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.17/index.global.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.17/index.global.min.css"
        />
      </head>
      <body>
        <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
