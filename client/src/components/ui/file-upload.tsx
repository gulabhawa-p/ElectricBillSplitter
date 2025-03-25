import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Camera, Upload, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUploaded: (url: string) => void;
  existingImage?: string;
  className?: string;
  variant?: "camera" | "upload";
  label?: string;
}

export function FileUpload({
  onFileUploaded,
  existingImage,
  className = "",
  variant = "camera",
  label
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(existingImage);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload image");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      setPreview(data.url);
      onFileUploaded(data.url);
      toast({
        title: "Image uploaded successfully",
        description: "Your image has been uploaded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Upload the file
      uploadMutation.mutate(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(undefined);
    onFileUploaded("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      {label && <label className="text-sm text-gray-600 block mb-1">{label}</label>}
      
      <div className="relative">
        {preview ? (
          <div 
            className="relative w-full h-32 border rounded-lg overflow-hidden bg-gray-100"
            onClick={triggerFileInput}
          >
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover" 
            />
            <button 
              type="button"
              onClick={removeImage}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
            >
              <X size={16} className="text-red-500" />
            </button>
          </div>
        ) : (
          variant === "camera" ? (
            <Button
              type="button"
              onClick={triggerFileInput}
              className="ml-2 bg-gray-200 rounded-full p-1 h-8 w-8 flex items-center justify-center"
              variant="ghost"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
              ) : (
                <Camera className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={triggerFileInput}
              className="flex items-center justify-center w-full border border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50"
              variant="ghost"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-gray-500" />
              ) : (
                <Upload className="mr-2 h-5 w-5 text-gray-500" />
              )}
              <span className="text-gray-500">Upload Image</span>
            </Button>
          )
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/jpeg,image/png,image/jpg"
        />
      </div>
    </div>
  );
}
