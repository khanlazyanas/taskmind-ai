import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from "@/components/ThemeProvider"; // NAYA IMPORT

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskMind | AI Workspace",
  description: "Intelligent workspace and automated workflow routing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/* NAYA: suppressHydrationWarning add kiya for next-themes */}
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          {/* NAYA: App ko ThemeProvider ke andar wrap kar diya */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}