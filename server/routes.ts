import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { calculationFormSchema, insertCalculationSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { fileURLToPath } from "url";

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup multer storage for file uploads
const storage_dir = path.join(__dirname, "uploads");
if (!fs.existsSync(storage_dir)) {
  fs.mkdirSync(storage_dir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, storage_dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: fileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpeg, .jpg and .png formats are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Route to handle image uploads
  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const file = req.file;
    const fileUrl = `/api/images/${file.filename}`;
    
    res.json({ 
      url: fileUrl,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size
    });
  });

  // Serve uploaded images
  app.get("/api/images/:filename", (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(storage_dir, filename);
    
    if (fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  });

  // Save calculation results
  app.post("/api/calculations", async (req, res) => {
    try {
      const calculationData = req.body;
      
      // Parse and validate the calculation data
      const validatedData = insertCalculationSchema.parse(calculationData);
      
      // Calculate the derived values before saving
      const mainMeterReading = Number(validatedData.mainMeterReading);
      const abcdMeterReading = Number(validatedData.abcdMeterReading);
      const xyzMeterReading = Number(validatedData.xyzMeterReading);
      const okbdMeterReading = Number(validatedData.okbdMeterReading);
      const billAmount = Number(validatedData.billAmount);
      
      const totalSubMeters = abcdMeterReading + xyzMeterReading + okbdMeterReading;
      const commonUsage = mainMeterReading - totalSubMeters;
      
      if (commonUsage < 0) {
        return res.status(400).json({ 
          message: "The sum of sub-meter readings cannot exceed the main meter reading" 
        });
      }
      
      const abcdShare = (abcdMeterReading / mainMeterReading) * billAmount;
      const xyzShare = (xyzMeterReading / mainMeterReading) * billAmount;
      const okbdShare = (okbdMeterReading / mainMeterReading) * billAmount;
      const commonShare = (commonUsage / mainMeterReading) * billAmount;
      
      // Combine original data with calculated values ensuring type consistency
      const calculationToSave = {
        ...validatedData,
        mainMeterReading: validatedData.mainMeterReading,
        abcdMeterReading: validatedData.abcdMeterReading,
        xyzMeterReading: validatedData.xyzMeterReading,
        okbdMeterReading: validatedData.okbdMeterReading,
        billAmount: validatedData.billAmount,
        commonUsage,
        abcdShare,
        xyzShare,
        okbdShare,
        commonShare
      };
      
      // Save the calculation with derived values
      const savedCalculation = await storage.saveCalculation(calculationToSave);
      
      res.status(201).json(savedCalculation);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred" });
      }
    }
  });

  // Get all calculations
  app.get("/api/calculations", async (_req, res) => {
    try {
      const calculations = await storage.getCalculations();
      res.json(calculations);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve calculations" });
    }
  });

  // Get calculation by ID
  app.get("/api/calculations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const calculation = await storage.getCalculationById(id);
      if (!calculation) {
        return res.status(404).json({ message: "Calculation not found" });
      }
      
      res.json(calculation);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve calculation" });
    }
  });

  // Delete calculation
  app.delete("/api/calculations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteCalculation(id);
      if (!success) {
        return res.status(404).json({ message: "Calculation not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete calculation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
