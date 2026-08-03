import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Smakfamiljen — recept utan stress", description: "Vardagsmat för riktiga familjer. En samling trygga, enkla recept för små och stora." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="sv"><body>{children}</body></html>;
}
