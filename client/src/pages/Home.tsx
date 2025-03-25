import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FileUpload } from "@/components/ui/file-upload";
import { calculationFormSchema, CalculationForm } from "@shared/schema";
import { calculateBillShares, getDefaultDates } from "@/lib/calculationUtils";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const defaultDates = getDefaultDates();
  
  // Initialize form with default values
  const form = useForm<CalculationForm>({
    resolver: zodResolver(calculationFormSchema),
    defaultValues: {
      fromDate: defaultDates.fromDate,
      toDate: defaultDates.toDate,
      mainMeterReading: 0,
      abcdMeterReading: 0,
      xyzMeterReading: 0,
      okbdMeterReading: 0,
      billAmount: 0,
      meterImages: {},
    },
  });

  const onSubmit = (data: CalculationForm) => {
    try {
      // Calculate bill shares
      const result = calculateBillShares(data);
      
      // Store the result in sessionStorage for the results page
      sessionStorage.setItem("calculationResult", JSON.stringify(result));
      
      // Navigate to results page
      navigate("/results");
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Date Picker Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h2 className="text-lg font-medium mb-2">Billing Period</h2>
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="fromDate"
                render={({ field }) => (
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                    label="From Date"
                    className="flex-1"
                  />
                )}
              />
              <FormField
                control={form.control}
                name="toDate"
                render={({ field }) => (
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                    label="To Date"
                    className="flex-1"
                  />
                )}
              />
            </div>
          </div>
          
          {/* Meter Readings Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h2 className="text-lg font-medium mb-3">Meter Readings</h2>
            
            {/* Main Meter */}
            <FormField
              control={form.control}
              name="mainMeterReading"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm text-gray-600">Main Meter Reading</FormLabel>
                  <div className="flex items-center">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter units"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="flex-1 border border-gray-300 rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </FormControl>
                    <FormField
                      control={form.control}
                      name="meterImages.mainMeter"
                      render={({ field }) => (
                        <FormControl>
                          <FileUpload
                            onFileUploaded={field.onChange}
                            existingImage={field.value}
                            variant="camera"
                          />
                        </FormControl>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* ABCD Sub-Meter */}
            <FormField
              control={form.control}
              name="abcdMeterReading"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm text-gray-600">ABCD Sub-Meter Reading</FormLabel>
                  <div className="flex items-center">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter units"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="flex-1 border border-gray-300 rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </FormControl>
                    <FormField
                      control={form.control}
                      name="meterImages.abcdMeter"
                      render={({ field }) => (
                        <FormControl>
                          <FileUpload
                            onFileUploaded={field.onChange}
                            existingImage={field.value}
                            variant="camera"
                          />
                        </FormControl>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* XYZ Sub-Meter */}
            <FormField
              control={form.control}
              name="xyzMeterReading"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm text-gray-600">XYZ Sub-Meter Reading</FormLabel>
                  <div className="flex items-center">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter units"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="flex-1 border border-gray-300 rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </FormControl>
                    <FormField
                      control={form.control}
                      name="meterImages.xyzMeter"
                      render={({ field }) => (
                        <FormControl>
                          <FileUpload
                            onFileUploaded={field.onChange}
                            existingImage={field.value}
                            variant="camera"
                          />
                        </FormControl>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* OKBD Sub-Meter */}
            <FormField
              control={form.control}
              name="okbdMeterReading"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm text-gray-600">OKBD Sub-Meter Reading</FormLabel>
                  <div className="flex items-center">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter units"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="flex-1 border border-gray-300 rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </FormControl>
                    <FormField
                      control={form.control}
                      name="meterImages.okbdMeter"
                      render={({ field }) => (
                        <FormControl>
                          <FileUpload
                            onFileUploaded={field.onChange}
                            existingImage={field.value}
                            variant="camera"
                          />
                        </FormControl>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Bill Amount Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="text-lg font-medium mb-3">DISCOM Bill Details</h2>
            <FormField
              control={form.control}
              name="billAmount"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm text-gray-600">Total Bill Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter bill amount"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-600">Bill Image (Optional)</FormLabel>
                  <FormControl>
                    <FileUpload
                      onFileUploaded={field.onChange}
                      existingImage={field.value}
                      variant="upload"
                      label=""
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Calculate Button */}
          <Button 
            type="submit" 
            className="w-full bg-primary text-white font-medium py-3 px-4 rounded-lg shadow-md hover:bg-primary-dark transition duration-300"
          >
            Calculate Shares
          </Button>
        </form>
      </Form>
    </div>
  );
}
