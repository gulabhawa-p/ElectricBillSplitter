import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { billFormSchema, type BillFormData } from "@shared/schema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useBillCalculator } from "@/hooks/use-bill-calculator";
import { DatePicker } from "@/components/date-picker";
import { MeterInput } from "@/components/meter-input";
import { PhotoUpload } from "@/components/photo-upload";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { calculateBiMonthlyEndDate } from "@/lib/utils";
import { Calculator, History } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const { calculateShares } = useBillCalculator();

  // Initialize form with default values
  const form = useForm<BillFormData>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      billingDate: new Date().toISOString().split("T")[0], // Today's date
      mainMeterReading: 0,
      abcdMeterReading: 0,
      xyzMeterReading: 0,
      okbdMeterReading: 0,
      billAmount: 0,
    },
  });

  // Save calculation mutation
  const saveCalculation = useMutation({
    mutationFn: async (data: BillFormData) => {
      // Calculate shares before saving
      const calculationResults = calculateShares(
        data.mainMeterReading,
        data.abcdMeterReading,
        data.xyzMeterReading,
        data.okbdMeterReading,
        data.billAmount
      );

      // Prepare form data for upload
      const formData = new FormData();
      
      // Add calculation data
      formData.append("data", JSON.stringify({
        billingDate: data.billingDate,
        mainMeterReading: data.mainMeterReading,
        abcdMeterReading: data.abcdMeterReading,
        xyzMeterReading: data.xyzMeterReading,
        okbdMeterReading: data.okbdMeterReading,
        billAmount: data.billAmount,
        commonUsage: calculationResults.commonUsage,
        abcdShare: calculationResults.abcdShare,
        xyzShare: calculationResults.xyzShare,
        okbdShare: calculationResults.okbdShare,
        commonShare: calculationResults.commonShare,
      }));
      
      // Add photos if any
      uploadedPhotos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo);
      });
      
      // Send data to server
      return apiRequest("POST", "/api/calculations", formData);
    },
    onSuccess: () => {
      toast({
        title: "Calculation saved successfully!",
        description: "Your calculation has been saved to history.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save calculation",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  function onSubmit(data: BillFormData) {
    try {
      // Calculate shares
      const results = calculateShares(
        data.mainMeterReading,
        data.abcdMeterReading,
        data.xyzMeterReading,
        data.okbdMeterReading,
        data.billAmount
      );
      
      // Set results in session storage to pass to results page
      sessionStorage.setItem(
        "calculationResults", 
        JSON.stringify({
          formData: data,
          results,
          photos: uploadedPhotos.map(p => URL.createObjectURL(p))
        })
      );
      
      // Navigate to results page
      setLocation("/results");
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate shares",
        variant: "destructive",
      });
    }
  }

  return (
    <>
      <header className="bg-primary text-on-primary p-4 flex items-center shadow-md">
        <h1 className="text-xl font-bold flex-1">ElectriBill</h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-primary-dark rounded-full"
          onClick={() => setLocation("/history")}
        >
          <History className="h-6 w-6" />
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium mb-4">Billing Period</h2>
                <DatePicker 
                  name="billingDate" 
                  control={form.control} 
                />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium mb-4">Meter Readings</h2>
                
                <MeterInput
                  name="mainMeterReading"
                  label="Main Meter Reading (kWh)"
                  control={form.control}
                />
                
                <MeterInput
                  name="abcdMeterReading"
                  label="ABCD Sub-Meter Reading (kWh)"
                  control={form.control}
                />
                
                <MeterInput
                  name="xyzMeterReading"
                  label="XYZ Sub-Meter Reading (kWh)"
                  control={form.control}
                />
                
                <MeterInput
                  name="okbdMeterReading"
                  label="OKBD Sub-Meter Reading (kWh)"
                  control={form.control}
                />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium mb-4">Bill Details</h2>
                
                <MeterInput
                  name="billAmount"
                  label="DISCOM Bill Amount (₹)"
                  control={form.control}
                />
                
                <PhotoUpload
                  photos={uploadedPhotos}
                  setPhotos={setUploadedPhotos}
                  maxPhotos={3}
                />
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full flex items-center justify-center py-6 shadow-md rounded-full"
            >
              <Calculator className="mr-2 h-5 w-5" />
              Calculate Shares
            </Button>
          </form>
        </Form>
      </main>
    </>
  );
}
