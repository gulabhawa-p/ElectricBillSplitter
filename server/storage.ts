import { 
  calculations, 
  type Calculation, 
  type InsertCalculation,
  type CalculationResult,
  users, 
  type User, 
  type InsertUser 
} from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Calculation methods
  saveCalculation(calculation: InsertCalculation & Partial<CalculationResult>): Promise<Calculation>;
  getCalculations(): Promise<Calculation[]>;
  getCalculationById(id: number): Promise<Calculation | undefined>;
  deleteCalculation(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private calculations: Map<number, Calculation>;
  private userCurrentId: number;
  private calculationCurrentId: number;

  constructor() {
    this.users = new Map();
    this.calculations = new Map();
    this.userCurrentId = 1;
    this.calculationCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveCalculation(calculation: InsertCalculation & Partial<CalculationResult>): Promise<Calculation> {
    const id = this.calculationCurrentId++;
    const createdAt = new Date();
    
    // Convert numeric string values to numbers for database storage
    const mainMeterReading = typeof calculation.mainMeterReading === 'string' 
      ? Number(calculation.mainMeterReading) 
      : calculation.mainMeterReading;
    
    const abcdMeterReading = typeof calculation.abcdMeterReading === 'string' 
      ? Number(calculation.abcdMeterReading) 
      : calculation.abcdMeterReading;
      
    const xyzMeterReading = typeof calculation.xyzMeterReading === 'string' 
      ? Number(calculation.xyzMeterReading) 
      : calculation.xyzMeterReading;
      
    const okbdMeterReading = typeof calculation.okbdMeterReading === 'string' 
      ? Number(calculation.okbdMeterReading) 
      : calculation.okbdMeterReading;
      
    const billAmount = typeof calculation.billAmount === 'string' 
      ? Number(calculation.billAmount) 
      : calculation.billAmount;
    
    const commonUsage = calculation.commonUsage !== undefined ? Number(calculation.commonUsage) : 0;
    const abcdShare = calculation.abcdShare !== undefined ? Number(calculation.abcdShare) : 0;
    const xyzShare = calculation.xyzShare !== undefined ? Number(calculation.xyzShare) : 0;
    const okbdShare = calculation.okbdShare !== undefined ? Number(calculation.okbdShare) : 0;
    const commonShare = calculation.commonShare !== undefined ? Number(calculation.commonShare) : 0;
    
    const newCalculation: Calculation = {
      id,
      createdAt,
      mainMeterReading,
      abcdMeterReading,
      xyzMeterReading,
      okbdMeterReading,
      billAmount,
      commonUsage,
      abcdShare,
      xyzShare,
      okbdShare,
      commonShare,
      fromDate: new Date(calculation.fromDate),
      toDate: new Date(calculation.toDate),
      meterImages: calculation.meterImages,
      billImage: calculation.billImage
    };
    
    this.calculations.set(id, newCalculation);
    return newCalculation;
  }

  async getCalculations(): Promise<Calculation[]> {
    return Array.from(this.calculations.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getCalculationById(id: number): Promise<Calculation | undefined> {
    return this.calculations.get(id);
  }

  async deleteCalculation(id: number): Promise<boolean> {
    return this.calculations.delete(id);
  }
}

export const storage = new MemStorage();
