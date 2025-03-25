import React from "react";
import Navigation from "./Navigation";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  // Determine title based on current route
  let title = "Electricity Bill Sharing";
  if (location === "/history") {
    title = "Calculation History";
  } else if (location.startsWith("/results")) {
    title = "Bill Sharing Results";
  }

  return (
    <div className="app-container min-h-screen flex flex-col max-w-md mx-auto">
      {/* App Bar */}
      <header className="bg-primary text-white shadow-md">
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-xl font-medium">{title}</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow bg-background">
        {children}
      </main>

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
}
