import { WorkloadProfile, ClusterConfig, NetworkConfig, StorageConfig, CostEstimate } from '../types';

export class SmartDefaultsEngine {
  private workloadProfiles: Map<string, ClusterConfig> = new Map();
  
  constructor() {
    this.initializeDefaultProfiles();
  }
  
  getOptimalConfig(profile: WorkloadProfile): ClusterConfig {
    const key = this.generateProfileKey(profile);
    return this.workloadProfiles.get(key) || this.generateCustomConfig(profile);
  }
  
  getRecommendedRegions(): string[] {
    return [
      'us-central1',
      'us-west1', 
      'us-east1',
      'europe-west1',
      'asia-southeast1'
    ];
  }
  
  getRecommendedMachineTypes(profile: WorkloadProfile): string[] {
    switch (profile.gpuType) {
      case 'A100':
        return ['a2-highgpu-1g', 'a2-highgpu-2g', 'a2-highgpu-4g', 'a2-highgpu-8g'];
      case 'H100':
        return ['h3-highgpu-1g', 'h3-highgpu-2g', 'h3-highgpu-4g', 'h3-highgpu-8g'];
      case 'A3-Ultra':
        return ['a3-highgpu-1g', 'a3-highgpu-2g', 'a3-highgpu-4g', 'a3-highgpu-8g'];
      default:
        return ['n1-standard-4', 'n1-standard-8', 'n1-standard-16'];
    }
  }
  
  private generateProfileKey(profile: WorkloadProfile): string {
    return `${profile.type}-${profile.modelSize}-${profile.gpuType}-${profile.nodeCount}-${profile.priority}`;
  }
  
  private generateCustomConfig(profile: WorkloadProfile): ClusterConfig {
    const region = this.detectOptimalRegion();
    const machineType = this.selectOptimalMachineType(profile);
    const gpuCount = this.calculateOptimalGPUCount(profile);
    
    return {
      region,
      zone: `${region}-a`,
      machineType,
      gpuCount,
      nodeCount: profile.nodeCount,
      networking: this.getOptimalNetworking(profile),
      storage: this.getOptimalStorage(profile),
      costEstimate: this.estimateCost(profile, machineType, gpuCount)
    };
  }
  
  private detectOptimalRegion(): string {
    // In real implementation, detect user's location and recommend optimal region
    return 'us-central1';
  }
  
  private selectOptimalMachineType(profile: WorkloadProfile): string {
    const machineTypes = this.getRecommendedMachineTypes(profile);
    
    switch (profile.priority) {
      case 'cost':
        return machineTypes[0]; // Cheapest option
      case 'performance':
        return machineTypes[machineTypes.length - 1]; // Most powerful option
      case 'balanced':
        return machineTypes[Math.floor(machineTypes.length / 2)]; // Middle option
      default:
        return machineTypes[0];
    }
  }
  
  private calculateOptimalGPUCount(profile: WorkloadProfile): number {
    switch (profile.modelSize) {
      case 'small':
        return Math.min(profile.nodeCount, 2);
      case 'medium':
        return Math.min(profile.nodeCount, 4);
      case 'large':
        return Math.min(profile.nodeCount, 8);
      default:
        return 1;
    }
  }
  
  private getOptimalNetworking(profile: WorkloadProfile): NetworkConfig {
    return {
      enableRDMA: profile.gpuType === 'A100' || profile.gpuType === 'H100',
      enableVPC: true,
      enablePrivateNodes: profile.priority === 'performance',
      enableMasterAuth: true
    };
  }
  
  private getOptimalStorage(profile: WorkloadProfile): StorageConfig {
    return {
      enablePersistentDisks: true,
      enableFilestore: profile.type === 'training',
      enableCloudStorage: true
    };
  }
  
  private estimateCost(profile: WorkloadProfile, machineType: string, gpuCount: number): CostEstimate {
    // Simplified cost estimation - in real implementation, this would call GCP pricing APIs
    const baseHourlyCost = this.getMachineTypeCost(machineType);
    const gpuHourlyCost = this.getGPUTypeCost(profile.gpuType) * gpuCount;
    const totalHourlyCost = baseHourlyCost + gpuHourlyCost;
    
    return {
      monthlyCost: totalHourlyCost * 24 * 30,
      hourlyCost: totalHourlyCost,
      currency: 'USD',
      breakdown: {
        compute: baseHourlyCost,
        gpu: gpuHourlyCost,
        storage: 50, // Estimated monthly storage cost
        networking: 20  // Estimated monthly networking cost
      }
    };
  }
  
  private getMachineTypeCost(machineType: string): number {
    // Simplified pricing - in real implementation, fetch from GCP pricing API
    const pricing: Record<string, number> = {
      'a2-highgpu-1g': 2.50,
      'a2-highgpu-2g': 5.00,
      'a2-highgpu-4g': 10.00,
      'a2-highgpu-8g': 20.00,
      'n1-standard-4': 0.19,
      'n1-standard-8': 0.38,
      'n1-standard-16': 0.76
    };
    return pricing[machineType] || 1.00;
  }
  
  private getGPUTypeCost(gpuType: string): number {
    // Simplified GPU pricing
    const pricing: Record<string, number> = {
      'A100': 2.25,
      'H100': 3.50,
      'A3-Ultra': 1.75,
      'T4': 0.35,
      'V100': 2.48
    };
    return pricing[gpuType] || 1.00;
  }
  
  private initializeDefaultProfiles(): void {
    // Pre-configured profiles for common use cases
    const profiles = [
      {
        profile: {
          type: 'training' as const,
          modelSize: 'medium' as const,
          gpuType: 'A100' as const,
          nodeCount: 2,
          priority: 'balanced' as const
        },
        config: {
          region: 'us-central1',
          zone: 'us-central1-a',
          machineType: 'a2-highgpu-2g',
          gpuCount: 2,
          nodeCount: 2,
          networking: {
            enableRDMA: true,
            enableVPC: true,
            enablePrivateNodes: false,
            enableMasterAuth: true
          },
          storage: {
            enablePersistentDisks: true,
            enableFilestore: true,
            enableCloudStorage: true
          },
          costEstimate: {
            monthlyCost: 1800,
            hourlyCost: 2.50,
            currency: 'USD',
            breakdown: { compute: 120, gpu: 1620, storage: 50, networking: 20 }
          }
        }
      }
    ];
    
    profiles.forEach(({ profile, config }) => {
      const key = this.generateProfileKey(profile);
      this.workloadProfiles.set(key, config);
    });
  }
}
