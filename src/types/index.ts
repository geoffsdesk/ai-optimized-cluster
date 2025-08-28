// Core interfaces for the AI Cluster Wizard
export interface PrerequisitesCheck {
  apiEnabled: boolean;
  iamRoles: string[];
  gcloudInstalled: boolean;
  regionSet: boolean;
  projectId: string;
  billingEnabled: boolean;
}

export interface WorkloadProfile {
  type: 'training' | 'inference' | 'fine-tuning';
  modelSize: 'small' | 'medium' | 'large';
  gpuType: 'A100' | 'H100' | 'A3-Ultra' | 'T4' | 'V100';
  nodeCount: number;
  priority: 'cost' | 'performance' | 'balanced';
}

export interface ClusterConfig {
  region: string;
  zone: string;
  machineType: string;
  gpuCount: number;
  nodeCount: number;
  networking: NetworkConfig;
  storage: StorageConfig;
  costEstimate: CostEstimate;
}

export interface NetworkConfig {
  enableRDMA: boolean;
  enableVPC: boolean;
  enablePrivateNodes: boolean;
  enableMasterAuth: boolean;
}

export interface StorageConfig {
  enablePersistentDisks: boolean;
  enableFilestore: boolean;
  enableCloudStorage: boolean;
}

export interface CostEstimate {
  monthlyCost: number;
  hourlyCost: number;
  currency: string;
  breakdown: Record<string, number>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface ProvisioningProgress {
  step: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number;
  message: string;
  timestamp: Date;
}
