import type { Metadata } from "next";
import "./globals.css";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Institution Data Processing Research Tool",
  description:
    "This project, which was originally built as an internal tool for Washington State University research through the Ukrainian Book Project, is now available to anyone for research and educational purposes. We are not affiliated with OCLC in any way. This tool utilizes the OCLC Registry API and requires that you have access to the API. This tool is entirely open source and available on GitHub.",
  authors: [
    {
      name: "Ruslan Mukhamedvaleev",
      url: "https://www.ruslan.in",
    },
  ],
  openGraph: {
    type: "website",
    title: "Institution Data Processing Research Tool",
    description:
      "This project, which was originally built as an internal tool for Washington State University research through the Ukrainian Book Project, is now available to anyone for research and educational purposes.",
    siteName: "Institution Data Processing Research Tool",
    images: [
      {
        url: "/opengraph.png",
        width: 1920,
        height: 1080,
        alt: "Institution Data Processing Research Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Institution Data Processing Research Tool",
    description:
      "A tool by Ruslan Mukhamedvaleev for the Ukrainian Book Project of Washington State University.",
    creator: "@mukhamedvaleev",
    images: ["/opengraph.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
