import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { PrerequisitesManager } from '../services/PrerequisitesManager';
import { PrerequisitesCheck } from '../types';

interface PrerequisitesCheckerProps {
  onComplete: () => void;
}

export const PrerequisitesChecker: React.FC<PrerequisitesCheckerProps> = ({ onComplete }) => {
  const [checks, setChecks] = useState<PrerequisitesCheck | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [manager] = useState(() => new PrerequisitesManager());

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = async () => {
    setIsChecking(true);
    try {
      const results = await manager.checkPrerequisites();
      setChecks(results);
      
      // Auto-complete if all checks pass
      if (results.apiEnabled && results.iamRoles.length === 0 && 
          results.gcloudInstalled && results.regionSet && results.billingEnabled) {
        setTimeout(() => onComplete(), 1500);
      }
    } catch (error) {
      console.error('Error checking prerequisites:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const autoFix = async () => {
    setIsFixing(true);
    try {
      await manager.autoFixPrerequisites();
      await runChecks(); // Re-run checks
    } catch (error) {
      console.error('Error fixing prerequisites:', error);
    } finally {
      setIsFixing(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    if (status) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusClass = (status: boolean) => {
    return status ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          <span className="text-blue-600 font-semibold">1</span>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Prerequisites Check</h2>
          <p className="text-gray-600">Verify your environment is ready for cluster creation</p>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={runChecks}
          disabled={isChecking}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium flex items-center"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            'Check Prerequisites'
          )}
        </button>
      </div>

      {checks && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${getStatusClass(checks.apiEnabled)}`}>
            <div className="flex items-center">
              {getStatusIcon(checks.apiEnabled)}
              <span className="ml-3 font-medium">Required APIs Enabled</span>
            </div>
            <p className="ml-8 mt-1 text-sm text-gray-600">
              {checks.apiEnabled ? 'All required APIs are enabled' : 'Some required APIs need to be enabled'}
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${getStatusClass(checks.iamRoles.length === 0)}`}>
            <div className="flex items-center">
              {getStatusIcon(checks.iamRoles.length === 0)}
              <span className="ml-3 font-medium">IAM Roles</span>
            </div>
            <p className="ml-8 mt-1 text-sm text-gray-600">
              {checks.iamRoles.length === 0 
                ? 'All required IAM roles are assigned' 
                : `${checks.iamRoles.length} IAM roles need to be assigned`
              }
            </p>
            {checks.iamRoles.length > 0 && (
              <div className="ml-8 mt-2">
                <p className="text-sm font-medium text-gray-700">Missing roles:</p>
                <ul className="text-sm text-gray-600 mt-1">
                  {checks.iamRoles.map(role => (
                    <li key={role} className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                      {role}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className={`p-4 rounded-lg border ${getStatusClass(checks.gcloudInstalled)}`}>
            <div className="flex items-center">
              {getStatusIcon(checks.gcloudInstalled)}
              <span className="ml-3 font-medium">gcloud CLI</span>
            </div>
            <p className="ml-8 mt-1 text-sm text-gray-600">
              {checks.gcloudInstalled ? 'gcloud CLI is installed and configured' : 'gcloud CLI needs to be installed'}
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${getStatusClass(checks.regionSet)}`}>
            <div className="flex items-center">
              {getStatusIcon(checks.regionSet)}
              <span className="ml-3 font-medium">Region Configuration</span>
            </div>
            <p className="ml-8 mt-1 text-sm text-gray-600">
              {checks.regionSet ? 'Region is configured' : 'Region needs to be configured'}
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${getStatusClass(checks.billingEnabled)}`}>
            <div className="flex items-center">
              {getStatusIcon(checks.billingEnabled)}
              <span className="ml-3 font-medium">Billing</span>
            </div>
            <p className="ml-8 mt-1 text-sm text-gray-600">
              {checks.billingEnabled ? 'Billing is enabled' : 'Billing needs to be enabled'}
            </p>
          </div>

          {checks.projectId && (
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <span className="font-medium text-gray-700">Project ID</span>
              </div>
              <p className="ml-8 mt-1 text-sm text-gray-600">
                {checks.projectId}
              </p>
            </div>
          )}

          {(!checks.apiEnabled || checks.iamRoles.length > 0 || !checks.gcloudInstalled || !checks.billingEnabled) ? (
            <div className="mt-6">
              <button
                onClick={autoFix}
                disabled={isFixing}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-3 rounded-lg font-medium flex items-center"
              >
                {isFixing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fixing Issues...
                  </>
                ) : (
                  'Auto-Fix Issues'
                )}
              </button>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-800 font-medium">All prerequisites met! 🎉</span>
              </div>
              <p className="text-green-700 mt-1">Your environment is ready for cluster creation.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
