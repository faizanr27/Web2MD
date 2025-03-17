import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  weight: ["300", "400", "700"], // Add required weights
});

export const metadata: Metadata = {
  title: "Web2Md",
  description: "Tool for turning sites into LLM ready data ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${robotoCondensed.variable} antialiased`}
      >
       <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
