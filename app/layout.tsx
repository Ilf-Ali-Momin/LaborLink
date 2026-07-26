import type { Metadata } from "next";
import { clash, switzer, jetbrains } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LaborLink — student jobs that keep you legal",
    template: "%s — LaborLink",
  },
  description:
    "Find Werkstudent and Minijob roles in Germany and track your hours against the legal limits. For employers: hire students without breaking labor law.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${clash.variable} ${switzer.variable} ${jetbrains.variable} font-body antialiased`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-signal focus:px-4 focus:py-2 focus:text-void"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
