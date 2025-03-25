import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Share, Save, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalculationResult } from "@shared/schema";
import { formatCurrency, formatDateRange } from "@/lib/calculationUtils";

// Extended type to include tenant names
interface ExtendedCalculationResult extends CalculationResult {
  tenantNames?: {
    abcd: string;
    xyz: string;
    okbd: string;
  };
}

export default function Results() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [result, setResult] = useState<ExtendedCalculationResult | null>(null);

  useEffect(() => {
    // Retrieve the calculation result from sessionStorage
    const storedResult = sessionStorage.getItem("calculationResult");
    if (!storedResult) {
      // Redirect to home if no result is found
      navigate("/");
      return;
    }
    
    try {
      const parsedResult = JSON.parse(storedResult) as ExtendedCalculationResult;
      setResult(parsedResult);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load calculation result",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [navigate, toast]);

  const saveMutation = useMutation({
    mutationFn: async (data: ExtendedCalculationResult) => {
      const response = await apiRequest("POST", "/api/calculations", {
        fromDate: data.fromDate,
        toDate: data.toDate,
        mainMeterReading: data.mainMeter,
        abcdMeterReading: data.abcdMeter,
        xyzMeterReading: data.xyzMeter,
        okbdMeterReading: data.okbdMeter,
        billAmount: data.billAmount,
        meterImages: data.meterImages,
        billImage: data.billImage,
        commonUsage: data.commonUsage,
        abcdShare: data.abcdShare,
        xyzShare: data.xyzShare,
        okbdShare: data.okbdShare,
        commonShare: data.commonShare
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculations"] });
      toast({
        title: "Success",
        description: "Calculation saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save calculation",
        variant: "destructive",
      });
    },
  });

  const handleShare = async () => {
    if (!result) return;
    
    try {
      // Build the share text
      const dateRange = formatDateRange(new Date(result.fromDate), new Date(result.toDate));
      const abcdName = result.tenantNames?.abcd || "ABCD";
      const xyzName = result.tenantNames?.xyz || "XYZ";
      const okbdName = result.tenantNames?.okbd || "OKBD";
      
      const shareText = `
Electricity Bill Sharing (${dateRange})

Total Bill: ₹${formatCurrency(result.billAmount)}

${abcdName}: ₹${formatCurrency(result.abcdShare)} (${result.abcdPercent.toFixed(1)}%)
${xyzName}: ₹${formatCurrency(result.xyzShare)} (${result.xyzPercent.toFixed(1)}%)
${okbdName}: ₹${formatCurrency(result.okbdShare)} (${result.okbdPercent.toFixed(1)}%)

Common: ₹${formatCurrency(result.commonShare)} (₹${formatCurrency(result.commonSharePerPerson)} each)
      `.trim();
      
      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: "Electricity Bill Sharing",
          text: shareText,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard",
          description: "You can now paste and share the calculation",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share calculation",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    if (result) {
      saveMutation.mutate(result);
    }
  };

  if (!result) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <p>Loading result...</p>
      </div>
    );
  }

  // Get tenant names with fallbacks
  const abcdName = result.tenantNames?.abcd || "ABCD";
  const xyzName = result.tenantNames?.xyz || "XYZ";
  const okbdName = result.tenantNames?.okbd || "OKBD";

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Calculation Results</h2>
          <div>
            <span className="text-sm text-gray-600">
              {formatDateRange(new Date(result.fromDate), new Date(result.toDate))}
            </span>
          </div>
        </div>
        
        {/* Units Summary */}
        <div className="border-b border-gray-200 pb-3 mb-3">
          <h3 className="text-sm text-gray-600 mb-2">Units Consumed</h3>
          <div className="grid grid-cols-2 gap-y-2">
            <div className="text-sm">Main Meter:</div>
            <div className="text-sm font-medium text-right">{result.mainMeter} units</div>
            
            <div className="text-sm">{abcdName}:</div>
            <div className="text-sm font-medium text-right">{result.abcdMeter} units</div>
            
            <div className="text-sm">{xyzName}:</div>
            <div className="text-sm font-medium text-right">{result.xyzMeter} units</div>
            
            <div className="text-sm">{okbdName}:</div>
            <div className="text-sm font-medium text-right">{result.okbdMeter} units</div>
            
            <div className="text-sm font-medium">Common Usage:</div>
            <div className="text-sm font-medium text-right">{result.commonUsage.toFixed(1)} units</div>
          </div>
        </div>
        
        {/* Share Amounts */}
        <div className="mb-4">
          <h3 className="text-sm text-gray-600 mb-2">Bill Shares</h3>
          <div className="text-right text-xs text-gray-500 mb-1">
            Total Bill: ₹{formatCurrency(result.billAmount)}
          </div>
          
          <div className="space-y-3">
            {/* ABCD Share */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{abcdName}</h4>
                  <div className="text-xs text-gray-500">{result.abcdPercent.toFixed(1)}% of total consumption</div>
                </div>
                <div className="text-lg font-medium text-primary">₹{formatCurrency(result.abcdShare)}</div>
              </div>
            </div>
            
            {/* XYZ Share */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{xyzName}</h4>
                  <div className="text-xs text-gray-500">{result.xyzPercent.toFixed(1)}% of total consumption</div>
                </div>
                <div className="text-lg font-medium text-primary">₹{formatCurrency(result.xyzShare)}</div>
              </div>
            </div>
            
            {/* OKBD Share */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{okbdName}</h4>
                  <div className="text-xs text-gray-500">{result.okbdPercent.toFixed(1)}% of total consumption</div>
                </div>
                <div className="text-lg font-medium text-primary">₹{formatCurrency(result.okbdShare)}</div>
              </div>
            </div>
            
            {/* Common Share */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Common Usage</h4>
                  <div className="text-xs text-gray-500">{result.commonPercent.toFixed(1)}% of total consumption</div>
                </div>
                <div className="text-lg font-medium text-primary">₹{formatCurrency(result.commonShare)}</div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Common share split equally: ₹{formatCurrency(result.commonSharePerPerson)} each
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleShare}
            className="flex-1 bg-primary text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-primary-dark transition duration-300 flex items-center justify-center"
          >
            <Share className="mr-1 h-4 w-4" />
            Share Results
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex-1 bg-[#03DAC6] text-black font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-[#018786] transition duration-300 flex items-center justify-center"
          >
            <Save className="mr-1 h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : "Save Entry"}
          </Button>
        </div>
        <Link href="/">
          <Button 
            className="w-full mt-3 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-300"
            variant="outline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Form
          </Button>
        </Link>
      </div>
    </div>
  );
}
