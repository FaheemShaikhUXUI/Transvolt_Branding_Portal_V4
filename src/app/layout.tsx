import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth/auth-context";
import { StatsProvider } from "@/lib/stats/stats-context";
import { AssetsProvider } from "@/lib/assets/assets-context";
import { CompanyMasterProvider } from "@/lib/company-master/company-master-context";
import { UserAccessProvider } from "@/lib/user-access/user-access-context";
import { AccessRequestProvider } from "@/lib/access-requests/access-request-context";
import { Toaster } from "@/components/ui/sonner";
import { BrandStatusIndicator } from "@/components/layout/brand-status-indicator";
import { DynamicFavicon } from "@/components/theme/dynamic-favicon";
import { ShinchanIdleScreensaver } from "@/components/idle/shinchan-idle-screensaver";
import { VehicleLineArtRunner } from "@/components/vehicle-animation/vehicle-line-art-runner";
import { UserAccessModal } from "@/components/user-access/user-access-modal";

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-sans',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Transvolt Branding Portal",
  description: "Transvolt internal Branding Asset Management Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html
        lang="en"
        suppressHydrationWarning
        className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", poppins.variable)}
      >
      <body className="min-h-full flex flex-col">
        <DynamicFavicon />
        {/* Animated Vehicle Line Art moving across the bottom of the screen every 15s */}
        <VehicleLineArtRunner />
        {/* Shinchan idle screensaver active after 40s of untouched screen or triggered by smiley button */}
        <ShinchanIdleScreensaver />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          themes={["light", "dark", "theme-navy"]}
          disableTransitionOnChange
        >
          <TooltipProvider>
            <AuthProvider>
              <AssetsProvider>
                <CompanyMasterProvider>
                  <StatsProvider>
                    <UserAccessProvider>
                      <AccessRequestProvider>
                        {children}
                        <UserAccessModal />
                        <Toaster position="top-center" />
                      </AccessRequestProvider>
                    </UserAccessProvider>
                  </StatsProvider>
                </CompanyMasterProvider>
              </AssetsProvider>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
