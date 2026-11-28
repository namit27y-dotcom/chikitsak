import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  LogIn,
  RefreshCw,
  Server,
  Upload,
} from 'lucide-react';
import {
  BackendAnalysisResponse,
  carePlanService,
} from '../../services/api/carePlanService';
import { CarePlan, ScreenId, UploadedReportFile } from '../../types/chikitsak';

interface ProcessingScreenProps {
  stagedFile: File | null;
  stagedMeta: UploadedReportFile | null;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
  onAnalysisSuccess: (plan: CarePlan) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  stagedFile,
  stagedMeta,
  isAuthenticated,
  onOpenAuth,
  onAnalysisSuccess,
  onNavigate,
}) => {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<BackendAnalysisResponse | null>(null);

  const runSubmission = async () => {
    if (!stagedFile || !stagedMeta) return;
    setChecking(true);
    const response = await carePlanService.submitReportForAnalysis(
      stagedFile,
      stagedMeta
    );
    setResult(response);
    setChecking(false);

    if (response.status === 'analyzed' && response.carePlan) {
      onAnalysisSuccess(response.carePlan);
    }
  };

  useEffect(() => {
    if (stagedFile && stagedMeta) {
      void runSubmission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagedMeta?.id, isAuthenticated]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-[#EAECE6] rounded-[20px] p-6 shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
        {/* Stepper: Step 2 Active */}
        <div className="flex items-center justify-between max-w-md mx-auto mb-7">
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-8 h-8 rounded-full bg-[#1E7E4E] text-white text-[13px] font-semibold flex items-center justify-center">
              ✓
            </span>
            <span className="text-[12px] font-medium text-[#1E7E4E]">Upload</span>
          </div>
          <div className="flex-1 h-[2px] bg-[#153D32] mx-3 -mt-5" />
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-8 h-8 rounded-full bg-[#153D32] text-white text-[13px] font-semibold flex items-center justify-center tabular-nums">
              2
            </span>
            <span className="text-[12px] font-semibold text-[#153D32]">Process</span>
          </div>
          <div className="flex-1 h-[2px] bg-[#E5E8DE] mx-3 -mt-5" />
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-8 h-8 rounded-full bg-[#EAF1E7] text-[#153D32]/65 text-[13px] font-semibold flex items-center justify-center tabular-nums">
              3
            </span>
            <span className="text-[12px] text-[#25312C]/60">Get Plan</span>
          </div>
        </div>

        {!stagedMeta ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-[#153D32]/45 mx-auto mb-3" />
            <h1 className="font-display text-[22px] font-semibold text-[#153D32]">
              No Report Selected Yet
            </h1>
            <p className="text-[13.5px] text-[#25312C]/70 mt-1.5">
              Please upload a discharge summary PDF or image first.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('upload')}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#153D32] text-white text-[13px] font-medium cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Go to Upload Screen</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Staged Document Card */}
            <div className="rounded-2xl bg-[#FAFBF8] border border-[#DCE9DC] p-4 flex items-center gap-4">
              {stagedMeta.previewUrl ? (
                <img
                  src={stagedMeta.previewUrl}
                  alt={stagedMeta.name}
                  className="w-16 h-16 rounded-xl object-cover border border-[#DCE9DC] shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#EAF1E7] flex items-center justify-center shrink-0">
                  <FileText className="w-7 h-7 text-[#153D32]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#153D32] truncate">
                  {stagedMeta.name}
                </p>
                <p className="text-[12.5px] text-[#25312C]/65 mt-0.5 tabular-nums">
                  Staged at {stagedMeta.uploadedAt} • Language:{' '}
                  {stagedMeta.selectedLanguage.toUpperCase()}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#EAF1E7] text-[#153D32] text-[11.5px] font-medium shrink-0">
                File Ready
              </span>
            </div>

            {checking ? (
              <div className="rounded-2xl border border-[#EAECE6] bg-[#FAFBF8] p-8 text-center">
                <Loader2 className="w-9 h-9 text-[#153D32] animate-spin mx-auto mb-3" />
                <h2 className="font-sans text-[16px] font-semibold text-[#153D32]">
                  Extracting &amp; Analyzing Discharge Summary...
                </h2>
                <p className="text-[13px] text-[#25312C]/70 mt-1">
                  Running document text extraction, Gemini AI care plan simplification,
                  and deterministic source validation.
                </p>
              </div>
            ) : (
              result && (
                <div className="rounded-2xl border border-[#E6D9B8] bg-[#FDFBF4] p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F7EED7] flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5 text-[#9A6B16]" />
                    </div>
                    <div>
                      <h2 className="font-sans text-[16px] font-semibold text-[#153D32]">
                        {result.status === 'auth_required'
                          ? 'Sign In Required to Process Report'
                          : result.status === 'ai_not_configured'
                          ? 'AI Service Not Configured'
                          : result.status === 'error'
                          ? 'Unable to Process Discharge Summary'
                          : 'Backend API Unavailable'}
                      </h2>
                      <p className="text-[13.5px] text-[#25312C]/85 mt-1 leading-relaxed">
                        {result.message}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-[#EAECE6] p-4 space-y-2 text-[12.5px]">
                    <div className="flex items-center gap-2 font-semibold text-[#153D32]">
                      <Server className="w-4 h-4" />
                      <span>CHIKITSAK Analysis Pipeline</span>
                    </div>
                    <p className="text-[#25312C]/75">
                      Endpoint:{' '}
                      <code className="px-1.5 py-0.5 rounded bg-[#F5F6F1] text-[#153D32]">
                        {result.endpointUrl}
                      </code>
                    </p>
                    <p className="text-[#25312C]/75">
                      CHIKITSAK never simulates or fabricates medical instructions when
                      document extraction or AI analysis cannot complete.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onNavigate('upload')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#DCE9DC] bg-white text-[13px] font-medium text-[#153D32] hover:bg-[#EAF1E7]/50 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Upload Another</span>
                      </button>

                      {result.status === 'auth_required' ? (
                        <button
                          type="button"
                          onClick={onOpenAuth}
                          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[13px] font-medium cursor-pointer"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Sign In / Register to Process</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void runSubmission()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#153D32]/25 bg-white text-[13px] font-medium text-[#153D32] hover:bg-[#EAF1E7]/50 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Retry Processing</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigate('care-plan')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#DCE9DC] bg-white hover:bg-[#EAF1E7]/60 text-[#153D32] text-[13px] font-medium cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>View Existing Care Plans</span>
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
