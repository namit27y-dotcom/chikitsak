import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CloudUpload,
  FileImage,
  FileText,
  Globe,
  Trash2,
} from 'lucide-react';
import {
  LanguageMode,
  ScreenId,
  UploadedReportFile,
} from '../../types/chikitsak';

interface UploadScreenProps {
  defaultLanguage: LanguageMode;
  onBack: () => void;
  onContinueToProcess: (file: File, meta: UploadedReportFile) => void;
  onNavigate: (screen: ScreenId) => void;
}

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({
  defaultLanguage,
  onBack,
  onContinueToProcess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageMode>(defaultLanguage);

  const handleFileSelection = (file: File) => {
    setErrorMessage(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage(
        'Unsupported format. Please select a PDF, JPG, or PNG discharge summary.'
      );
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage('File exceeds the 10 MB size limit. Please choose a smaller file.');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setUploadProgress(0);

    const objectUrl = file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : null;
    setPreviewUrl(objectUrl);

    // Track actual local FileReader progress
    const reader = new FileReader();
    reader.onprogress = (ev) => {
      if (ev.lengthComputable) {
        setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    };
    reader.onloadend = () => {
      setUploadProgress(100);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContinue = () => {
    if (!selectedFile) return;
    const meta: UploadedReportFile = {
      id: `upload-${Date.now()}`,
      name: selectedFile.name,
      sizeBytes: selectedFile.size,
      mimeType: selectedFile.type,
      previewUrl,
      uploadedAt: new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      selectedLanguage: language,
    };
    onContinueToProcess(selectedFile, meta);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Stepper matching reference */}
      <div className="bg-white border border-[#EAECE6] rounded-[20px] p-6 shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-[26px] font-semibold text-[#153D32]">
              Upload Discharge Summary
            </h1>
            <p className="text-[13.5px] text-[#25312C]/70 mt-0.5">
              Upload your hospital discharge paper or prescription for structured care guidance.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#DCE9DC] text-[13px] font-medium text-[#153D32] hover:bg-[#EAF1E7]/60 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* 3-Step Indicator */}
        <div className="flex items-center justify-between max-w-md mx-auto mb-7">
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-8 h-8 rounded-full bg-[#153D32] text-white text-[13px] font-semibold flex items-center justify-center tabular-nums">
              1
            </span>
            <span className="text-[12px] font-semibold text-[#153D32]">Upload</span>
          </div>
          <div className="flex-1 h-[2px] bg-[#E5E8DE] mx-3 -mt-5" />
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-8 h-8 rounded-full bg-[#EAF1E7] text-[#153D32]/65 text-[13px] font-semibold flex items-center justify-center tabular-nums">
              2
            </span>
            <span className="text-[12px] text-[#25312C]/60">Process</span>
          </div>
          <div className="flex-1 h-[2px] bg-[#E5E8DE] mx-3 -mt-5" />
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-8 h-8 rounded-full bg-[#EAF1E7] text-[#153D32]/65 text-[13px] font-semibold flex items-center justify-center tabular-nums">
              3
            </span>
            <span className="text-[12px] text-[#25312C]/60">Get Plan</span>
          </div>
        </div>

        {/* Drag & Drop Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? 'border-[#153D32] bg-[#EAF1E7]/70'
              : 'border-[#C5D5C5] bg-[#FAFBF8]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelection(file);
            }}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-full bg-[#EAF1E7] mx-auto flex items-center justify-center mb-4">
            <CloudUpload className="w-8 h-8 text-[#153D32]" />
          </div>

          <h2 className="font-sans text-[17px] font-semibold text-[#153D32]">
            Upload Your Discharge Summary
          </h2>
          <p className="text-[13px] text-[#25312C]/70 mt-1">
            Drag &amp; drop your PDF or image file here, or click to browse
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[13px] font-medium transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Choose File</span>
          </button>

          <p className="mt-3 text-[11.5px] text-[#25312C]/55">
            Supports: PDF, JPG, PNG (Max 10MB)
          </p>
        </div>

        {/* Validation Error */}
        {errorMessage && (
          <div className="mt-4 rounded-xl bg-[#FDF2F2] border border-[#F5C6CB] px-4 py-3 flex items-center gap-2.5 text-[13px] text-[#9B1C1C]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Selected File Preview & Progress */}
        {selectedFile && (
          <div className="mt-5 rounded-2xl bg-[#FAFBF8] border border-[#DCE9DC] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={`Preview of ${selectedFile.name}`}
                    className="w-16 h-16 rounded-xl object-cover border border-[#DCE9DC] shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#EAF1E7] flex items-center justify-center shrink-0">
                    {selectedFile.type === 'application/pdf' ? (
                      <FileText className="w-7 h-7 text-[#153D32]" />
                    ) : (
                      <FileImage className="w-7 h-7 text-[#153D32]" />
                    )}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#153D32] truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[12px] text-[#25312C]/65 mt-0.5 tabular-nums">
                    {selectedFile.type === 'application/pdf'
                      ? 'PDF Document'
                      : 'Image File'}{' '}
                    • {formatFileSize(selectedFile.size)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-40 h-2 rounded-full bg-[#DCE9DC] overflow-hidden">
                      <div
                        className="h-full bg-[#153D32] transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-[11.5px] font-medium text-[#153D32] tabular-nums flex items-center gap-1">
                      {uploadProgress === 100 && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1E7E4E]" />
                      )}
                      {uploadProgress}%
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                aria-label="Remove selected file"
                className="p-2 rounded-lg text-[#25312C]/60 hover:text-[#B91C1C] hover:bg-[#FDF2F2] transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Output Language Preference */}
        <div className="mt-5 pt-5 border-t border-[#EAECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-[#153D32]" />
            <span className="text-[13.5px] font-medium text-[#25312C]">
              Care Plan Language:
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(
              [
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'हिन्दी' },
                { id: 'bilingual', label: 'English + हिन्दी' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLanguage(opt.id)}
                className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-colors cursor-pointer ${
                  language === opt.id
                    ? 'bg-[#153D32] text-white'
                    : 'bg-[#EAF1E7]/70 text-[#153D32] hover:bg-[#DCE9DC]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#DCE9DC] text-[13px] font-medium text-[#25312C] hover:bg-[#FAFBF8] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            disabled={!selectedFile || uploadProgress < 100}
            onClick={handleContinue}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#153D32] hover:bg-[#0E3025] disabled:bg-[#9FB2A9] disabled:cursor-not-allowed text-white text-[13.5px] font-medium transition-colors cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
