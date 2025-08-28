import React, { useState } from 'react';
import { ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { WorkloadProfile, ClusterConfig } from '../types';
import { SmartDefaultsEngine } from '../services/SmartDefaultsEngine';
import { ConfigValidator } from '../services/ConfigValidator';

interface ClusterWizardProps {
  onComplete: (profile: WorkloadProfile, config: ClusterConfig) => void;
}

export const ClusterWizard: React.FC<ClusterWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [workloadProfile, setWorkloadProfile] = useState<Partial<WorkloadProfile>>({});
  const [clusterConfig, setClusterConfig] = useState<ClusterConfig | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [smartDefaults] = useState(() => new SmartDefaultsEngine());
  const [validator] = useState(() => new ConfigValidator());

  const steps = [
    {
      title: 'Workload Type',
      description: 'What type of AI workload are you planning to run?'
    },
    {
      title: 'Model Size',
      description: 'What is the size of your AI model?'
    },
    {
      title: 'GPU Requirements',
      description: 'What GPU type do you need for optimal performance?'
    },
    {
      title: 'Scale & Priority',
      description: 'How many nodes do you need and what\'s your priority?'
    },
    {
      title: 'Review & Generate',
      description: 'Review your configuration and generate the cluster'
    }
  ];

  const workloadTypes = [
    { value: 'training', label: 'Model Training', description: 'Training large AI models from scratch' },
    { value: 'inference', label: 'Model Inference', description: 'Running trained models for predictions' },
    { value: 'fine-tuning', label: 'Fine-tuning', description: 'Adapting pre-trained models to your data' }
  ];

  const modelSizes = [
    { value: 'small', label: 'Small (< 1B parameters)', description: 'Fast training, lower resource requirements' },
    { value: 'medium', label: 'Medium (1B - 10B parameters)', description: 'Balanced performance and resources' },
    { value: 'large', label: 'Large (> 10B parameters)', description: 'High performance, significant resources needed' }
  ];

  const gpuTypes = [
    { value: 'A100', label: 'NVIDIA A100', description: 'Best for large model training, highest performance' },
    { value: 'H100', label: 'NVIDIA H100', description: 'Latest generation, maximum performance' },
    { value: 'A3-Ultra', label: 'Google A3-Ultra', description: 'Google\'s custom AI accelerator' },
    { value: 'T4', label: 'NVIDIA T4', description: 'Cost-effective for inference workloads' },
    { value: 'V100', label: 'NVIDIA V100', description: 'Proven performance, good value' }
  ];

  const priorities = [
    { value: 'cost', label: 'Cost Optimized', description: 'Minimize costs while meeting requirements' },
    { value: 'performance', label: 'Performance Optimized', description: 'Maximum performance regardless of cost' },
    { value: 'balanced', label: 'Balanced', description: 'Good balance of performance and cost' }
  ];

  const handleStepComplete = (stepData: Partial<WorkloadProfile>) => {
    const updatedProfile = { ...workloadProfile, ...stepData };
    setWorkloadProfile(updatedProfile);
    
    if (currentStep < steps.length - 2) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(steps.length - 1);
    }
  };

  const handleGenerateConfig = async () => {
    if (!workloadProfile.type || !workloadProfile.modelSize || !workloadProfile.gpuType || 
        !workloadProfile.nodeCount || !workloadProfile.priority) {
      return;
    }

    setIsGenerating(true);
    
    try {
      const completeProfile = workloadProfile as WorkloadProfile;
      const config = smartDefaults.getOptimalConfig(completeProfile);
      const validation = validator.validateClusterConfig(config);
      
      setClusterConfig(config);
      setValidationResult(validation);
    } catch (error) {
      console.error('Error generating configuration:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    if (clusterConfig && workloadProfile.type && workloadProfile.modelSize && 
        workloadProfile.gpuType && workloadProfile.nodeCount && workloadProfile.priority) {
      const completeProfile = workloadProfile as WorkloadProfile;
      onComplete(completeProfile, clusterConfig);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Select Workload Type</h3>
            <div className="grid gap-4">
              {workloadTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => handleStepComplete({ type: type.value as any })}
                  className={`p-4 text-left border rounded-lg hover:border-blue-300 transition-colors ${
                    workloadProfile.type === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Select Model Size</h3>
            <div className="grid gap-4">
              {modelSizes.map(size => (
                <button
                  key={size.value}
                  onClick={() => handleStepComplete({ modelSize: size.value as any })}
                  className={`p-4 text-left border rounded-lg hover:border-blue-300 transition-colors ${
                    workloadProfile.modelSize === size.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{size.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{size.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Select GPU Type</h3>
            <div className="grid gap-4">
              {gpuTypes.map(gpu => (
                <button
                  key={gpu.value}
                  onClick={() => handleStepComplete({ gpuType: gpu.value as any })}
                  className={`p-4 text-left border rounded-lg hover:border-blue-300 transition-colors ${
                    workloadProfile.gpuType === gpu.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{gpu.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{gpu.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Scale & Priority</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Nodes
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={workloadProfile.nodeCount || 1}
                  onChange={(e) => setWorkloadProfile(prev => ({ ...prev, nodeCount: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">Recommended: 1-10 for development, 10+ for production</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="grid gap-3">
                  {priorities.map(priority => (
                    <button
                      key={priority.value}
                      onClick={() => handleStepComplete({ priority: priority.value as any })}
                      className={`p-3 text-left border rounded-lg hover:border-blue-300 transition-colors ${
                        workloadProfile.priority === priority.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{priority.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{priority.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(4)}
              disabled={!workloadProfile.nodeCount || !workloadProfile.priority}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium"
            >
              Continue to Review
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Review Configuration</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Workload Profile</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium">{workloadProfile.type}</span>
                </div>
                <div>
                  <span className="text-gray-600">Model Size:</span>
                  <span className="ml-2 font-medium">{workloadProfile.modelSize}</span>
                </div>
                <div>
                  <span className="text-gray-600">GPU Type:</span>
                  <span className="ml-2 font-medium">{workloadProfile.gpuType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Node Count:</span>
                  <span className="ml-2 font-medium">{workloadProfile.nodeCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Priority:</span>
                  <span className="ml-2 font-medium">{workloadProfile.priority}</span>
                </div>
              </div>
            </div>

            {!clusterConfig ? (
              <button
                onClick={handleGenerateConfig}
                disabled={isGenerating}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Configuration...
                  </>
                ) : (
                  'Generate Cluster Configuration'
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Generated Configuration</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
