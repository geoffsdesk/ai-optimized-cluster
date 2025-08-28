import { ClusterConfig, ValidationResult } from '../types';

export class ConfigValidator {
  validateClusterConfig(config: ClusterConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Validate GPU configuration
    if (config.gpuCount > 8) {
      errors.push('Maximum 8 GPUs per node supported');
    }
    
    if (config.gpuCount < 1) {
      errors.push('At least 1 GPU is required for AI workloads');
    }
    
    // Validate node count
    if (config.nodeCount < 1) {
      errors.push('At least 1 node is required');
    }
    
    if (config.nodeCount > 100) {
      warnings.push('Large node counts may impact cluster management');
      recommendations.push('Consider using node pools for better resource management');
    }
    
    // Validate networking
    if (config.networking.enableRDMA && !this.supportsRDMA(config.machineType)) {
      errors.push('RDMA not supported on selected machine type');
    }
    
    // Validate region/zone
    if (!this.isValidRegion(config.region)) {
      errors.push(`Invalid region: ${config.region}`);
    }
    
    if (!this.isValidZone(config.zone, config.region)) {
      errors.push(`Invalid zone: ${config.zone} for region: ${config.region}`);
    }
    
    // Cost optimization recommendations
    if (config.nodeCount > 10) {
      recommendations.push('Consider using spot instances for cost optimization');
    }
    
    if (config.costEstimate.monthlyCost > 5000) {
      warnings.push('High monthly cost detected');
      recommendations.push('Review resource allocation and consider cost optimization strategies');
    }
    
    // Performance recommendations
    if (config.networking.enableRDMA) {
      recommendations.push('RDMA enabled - ensure proper network configuration for optimal performance');
    }
    
    if (config.storage.enableFilestore) {
      recommendations.push('Filestore enabled - consider performance tier based on workload requirements');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }
  
  private supportsRDMA(machineType: string): boolean {
    const rdmaSupportedTypes = [
      'a2-highgpu-1g', 'a2-highgpu-2g', 'a2-highgpu-4g', 'a2-highgpu-8g',
      'h3-highgpu-1g', 'h3-highgpu-2g', 'h3-highgpu-4g', 'h3-highgpu-8g'
    ];
    return rdmaSupportedTypes.includes(machineType);
  }
  
  private isValidRegion(region: string): boolean {
    const validRegions = [
      'us-central1', 'us-west1', 'us-east1', 'us-east4',
      'europe-west1', 'europe-west4', 'asia-southeast1', 'asia-northeast1'
    ];
    return validRegions.includes(region);
  }
  
  private isValidZone(zone: string, region: string): boolean {
    const validZones = ['a', 'b', 'c'];
    const zoneSuffix = zone.split('-').pop();
    return zone.startsWith(region) && validZones.includes(zoneSuffix || '');
  }
}
