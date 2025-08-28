import { PrerequisitesCheck } from '../types';

export class PrerequisitesManager {
  private projectId: string = '';
  private region: string = '';
  private apisEnabled: boolean = false;
  private iamRolesFixed: boolean = false;
  private gcloudInstalled: boolean = false;
  private billingEnabled: boolean = false;

  async checkPrerequisites(): Promise<PrerequisitesCheck> {
    try {
      const checks = await Promise.all([
        this.checkProjectId(),
        this.checkAPIs(),
        this.checkIAMRoles(),
        this.checkGcloudCLI(),
        this.checkRegionConfig(),
        this.checkBilling()
      ]);
      
      return this.aggregateResults(checks);
    } catch (error) {
      console.error('Error checking prerequisites:', error);
      throw error;
    }
  }
  
  async autoFixPrerequisites(): Promise<void> {
    const issues = await this.checkPrerequisites();
    
    if (!issues.apiEnabled) {
      await this.enableRequiredAPIs();
      this.apisEnabled = true; // Mark as fixed
    }
    
    if (issues.iamRoles.length > 0) {
      await this.setupIAMRoles(issues.iamRoles);
      this.iamRolesFixed = true; // Mark as fixed
    }
    
    if (!issues.gcloudInstalled) {
      await this.installGcloudCLI();
      this.gcloudInstalled = true; // Mark as fixed
    }
    
    if (!issues.billingEnabled) {
      await this.enableBilling();
      this.billingEnabled = true; // Mark as fixed
    }
  }
  
  private async checkProjectId(): Promise<Partial<PrerequisitesCheck>> {
    // Simulate checking if project ID is set
    this.projectId = 'your-project-id';
    return { projectId: this.projectId };
  }
  
  private async checkAPIs(): Promise<Partial<PrerequisitesCheck>> {
    const requiredAPIs = [
      'container.googleapis.com',
      'compute.googleapis.com',
      'iam.googleapis.com',
      'file.googleapis.com',
      'storage.googleapis.com'
    ];
    
    // Use the fixed state if available, otherwise simulate some APIs not enabled
    if (this.apisEnabled) {
      return { apiEnabled: true };
    }
    
    const enabledAPIs = await this.getEnabledAPIs();
    const allEnabled = requiredAPIs.every(api => enabledAPIs.includes(api));
    
    return { apiEnabled: allEnabled };
  }
  
  private async checkIAMRoles(): Promise<Partial<PrerequisitesCheck>> {
    const requiredRoles = [
      'roles/container.admin',
      'roles/compute.admin',
      'roles/iam.serviceAccountAdmin'
    ];
    
    // Use the fixed state if available, otherwise simulate missing roles
    if (this.iamRolesFixed) {
      return { iamRoles: [] };
    }
    
    const userRoles = await this.getUserRoles();
    const missingRoles = requiredRoles.filter(role => !userRoles.includes(role));
    
    return { iamRoles: missingRoles };
  }
  
  private async checkGcloudCLI(): Promise<Partial<PrerequisitesCheck>> {
    // Use the fixed state if available, otherwise simulate not installed
    if (this.gcloudInstalled) {
      return { gcloudInstalled: true };
    }
    
    const isInstalled = await this.checkGcloudInstallation();
    return { gcloudInstalled: isInstalled };
  }
  
  private async checkRegionConfig(): Promise<Partial<PrerequisitesCheck>> {
    // Simulate region configuration check
    this.region = 'us-central1';
    return { regionSet: !!this.region };
  }
  
  private async checkBilling(): Promise<Partial<PrerequisitesCheck>> {
    // Use the fixed state if available, otherwise simulate not enabled
    if (this.billingEnabled) {
      return { billingEnabled: true };
    }
    
    const billingEnabled = await this.checkBillingStatus();
    return { billingEnabled };
  }
  
  private aggregateResults(checks: Partial<PrerequisitesCheck>[]): PrerequisitesCheck {
    return checks.reduce((acc, check) => ({ ...acc, ...check }), {
      apiEnabled: false,
      iamRoles: [],
      gcloudInstalled: false,
      regionSet: false,
      projectId: '',
      billingEnabled: false
    });
  }
  
  // Mock implementations for demonstration
  private async getEnabledAPIs(): Promise<string[]> {
    // Simulate some APIs enabled, some not
    return ['container.googleapis.com', 'compute.googleapis.com'];
  }
  
  private async getUserRoles(): Promise<string[]> {
    // Simulate missing some roles
    return ['roles/container.admin'];
  }
  
  private async checkGcloudInstallation(): Promise<boolean> {
    // Simulate gcloud not installed
    return false;
  }
  
  private async checkBillingStatus(): Promise<boolean> {
    // Simulate billing NOT enabled
    return false;
  }
  
  private async enableRequiredAPIs(): Promise<void> {
    console.log('Enabling required APIs...');
    // Simulate API enablement
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  private async setupIAMRoles(roles: string[]): Promise<void> {
    console.log(`Setting up IAM roles: ${roles.join(', ')}`);
    // Simulate IAM role setup
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  private async installGcloudCLI(): Promise<void> {
    console.log('Installing gcloud CLI...');
    // Simulate gcloud installation
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  private async enableBilling(): Promise<void> {
    console.log('Enabling billing...');
    // Simulate billing enablement
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
