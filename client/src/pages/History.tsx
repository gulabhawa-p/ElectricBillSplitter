import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calculation } from "@shared/schema";
import { formatCurrency, formatDateRange } from "@/lib/calculationUtils";
import { Skeleton } from "@/components/ui/skeleton";

export default function History() {
  const { data: calculations, isLoading, error } = useQuery<Calculation[]>({ 
    queryKey: ["/api/calculations"] 
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-lg font-medium mb-3">Calculation History</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-3 w-32 mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-lg font-medium mb-3">Calculation History</h2>
          <div className="text-red-500 p-3 bg-red-50 rounded-lg">
            Error loading calculations. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-lg font-medium mb-3">Calculation History</h2>
        
        {calculations && calculations.length > 0 ? (
          <div className="space-y-3">
            {calculations.map((calculation) => (
              <div key={calculation.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">
                    {formatDateRange(new Date(calculation.fromDate), new Date(calculation.toDate))}
                  </div>
                  <div className="text-sm text-gray-500">
                    Total: ₹{formatCurrency(Number(calculation.billAmount))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>ABCD: ₹{formatCurrency(Number(calculation.abcdShare))}</div>
                  <div>XYZ: ₹{formatCurrency(Number(calculation.xyzShare))}</div>
                  <div>OKBD: ₹{formatCurrency(Number(calculation.okbdShare))}</div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Common: ₹{formatCurrency(Number(calculation.commonShare))} (₹{formatCurrency(Number(calculation.commonShare) / 3)} each)
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No calculations saved yet</p>
            <Link href="/">
              <Button variant="outline" className="mt-3">
                Create Your First Calculation
              </Button>
            </Link>
          </div>
        )}
        
        <Link href="/">
          <Button
            className="w-full mt-4 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-300"
            variant="outline"
          >
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
