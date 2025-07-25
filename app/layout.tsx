import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@mdxeditor/editor/style.css";
import "./globals.css";
import ClerkProvider from "@/services/clerk/components/ClerkProvider";
import { Toaster } from "@/components/ui/sonner";
import { UploadthingSSR } from "@/services/uploadthing/components/UploadthingSSR";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cube Jobs | Find your next job",
  description: "Cube Jobs is a job board for the modern workforce.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased 
            `}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-right" />
            <UploadthingSSR />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
