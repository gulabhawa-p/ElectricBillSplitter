import React from "react";
import { Link, useLocation } from "wouter";
import { Home, History } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path === "/history" && location === "/history") return true;
    if (path === "/" && location.startsWith("/results")) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-lg py-2 px-4 border-t border-gray-200">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center px-3 py-1 ${isActive("/") ? "text-primary" : "text-gray-500"}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/history">
          <a className={`flex flex-col items-center px-3 py-1 ${isActive("/history") ? "text-primary" : "text-gray-500"}`}>
            <History className="h-6 w-6" />
            <span className="text-xs mt-1">History</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
