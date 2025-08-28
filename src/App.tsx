import React, { useState } from 'react';
import { PrerequisitesChecker } from './components/PrerequisitesChecker';
import { ClusterWizard } from './components/ClusterWizard';
import { ProgressTracker } from './components/ProgressTracker';
import { WorkloadProfile, ClusterConfig, ProvisioningProgress } from './types';

function App() {
  const [currentStep, setCurrentStep] = useState<'prerequisites' | 'wizard' | 'provisioning'>('prerequisites');
  const [workloadProfile, setWorkloadProfile] = useState<WorkloadProfile | null>(null);
  const [clusterConfig, setClusterConfig] = useState<ClusterConfig | null>(null);
  const [provisioningProgress, setProvisioningProgress] = useState<ProvisioningProgress[]>([]);

  const handlePrerequisitesComplete = () => {
    setCurrentStep('wizard');
  };

  const handleWizardComplete = (profile: WorkloadProfile, config: ClusterConfig) => {
    setWorkloadProfile(profile);
    setClusterConfig(config);
    setCurrentStep('provisioning');
  };

  const handleBackToWizard = () => {
    setCurrentStep('wizard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI-Optimized GKE Cluster Wizard
          </h1>
          <p className="text-xl text-gray-600">
            Reduce cluster setup time from hours to minutes
          </p>
        </header>

        <ProgressTracker currentStep={currentStep} />

        <main className="max-w-4xl mx-auto">
          {currentStep === 'prerequisites' && (
            <PrerequisitesChecker onComplete={handlePrerequisitesComplete} />
          )}
          
          {currentStep === 'wizard' && (
            <ClusterWizard onComplete={handleWizardComplete} />
          )}
          
          {currentStep === 'provisioning' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Cluster Provisioning</h2>
              <p className="text-gray-600 mb-4">
                Your AI-optimized GKE cluster is being provisioned...
              </p>
              <button
                onClick={handleBackToWizard}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Back to Configuration
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
