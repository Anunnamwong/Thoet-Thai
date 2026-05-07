import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "เทอดไทย — สั่งอาหารส่งในชุมชน",
  description: "สั่งอาหารจากร้านในตำบลเทอดไทย ส่งถึงบ้านไวใน 30 นาที",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={`${ibmPlexSansThai.variable} font-sans bg-surface-bg text-text-primary antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
