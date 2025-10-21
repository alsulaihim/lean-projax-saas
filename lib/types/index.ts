// Core type definitions for the BPI Assignment Platform

export enum UserRole {
  BPI_TEAM = 'BPI_TEAM',
  TEAM_LEAD = 'TEAM_LEAD',
  EXECUTIVE = 'EXECUTIVE',
  PROCESS_OWNER = 'PROCESS_OWNER'
}

export enum AssignmentStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  REOPENED = 'REOPENED'
}

export enum SIPOCColumn {
  SUPPLIER = 'SUPPLIER',
  INPUT = 'INPUT',
  PROCESS = 'PROCESS',
  OUTPUT = 'OUTPUT',
  CUSTOMER = 'CUSTOMER'
}

export enum FishboneCategoryType {
  PEOPLE = 'PEOPLE',
  PROCESS = 'PROCESS',
  EQUIPMENT = 'EQUIPMENT',
  MATERIALS = 'MATERIALS',
  ENVIRONMENT = 'ENVIRONMENT',
  MANAGEMENT = 'MANAGEMENT'
}

export enum ImplementationDifficulty {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum RecommendationStatus {
  PROPOSED = 'PROPOSED',
  APPROVED = 'APPROVED',
  IMPLEMENTED = 'IMPLEMENTED'
}

export enum AuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  COMPLETED = 'COMPLETED',
  REOPENED = 'REOPENED',
  DELETED = 'DELETED',
  ACCESSED = 'ACCESSED'
}

// Computed fields interfaces
export interface ProcessCapability {
  cp: number | null;  // (USL - LSL) / (6 * σ)
  cpk: number | null; // min((USL - μ) / (3σ), (μ - LSL) / (3σ))
  sigmaLevel: number | null; // Cpk * 3 + 1.5
}

export interface VSMMetrics {
  totalCycleTime: number;
  valueAddedTime: number;
  nonValueAddedTime: number;
  efficiencyRatio: number; // valueAddedTime / totalCycleTime
}

export interface ParetoData {
  stepName: string;
  duration: number;
  cumulativePercent: number;
  rank: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId: string;
}