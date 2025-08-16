import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../../styles/globals.css";
import { GridProvider } from "@/contexts/GridContext";
import { TerrainProvider } from "@/contexts/TerrainContext";
import { VegetationProvider } from "@/contexts/VegetationContext";
import { TerrainEditingProvider } from "@/contexts/TerrainEditingContext";
import TopMenu from "@/components/TopMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Residential Design Tool",
  description: "A tool for designing residential layouts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GridProvider>
          <TerrainProvider>
            <VegetationProvider>
              <TerrainEditingProvider>
                <TopMenu />
                {children}
              </TerrainEditingProvider>
            </VegetationProvider>
          </TerrainProvider>
        </GridProvider>
      </body>
    </html>
  );
}
