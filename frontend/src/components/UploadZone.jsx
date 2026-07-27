import React, { useCallback, useState } from 'react';
import { UploadCloud, FileImage, Loader2, Sparkles, Scan, Brain } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const UploadZone = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a valid image file (JPG, PNG).');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_URL}/api/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onUploadSuccess(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'An error occurred during analysis.');
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container border border-white/5 text-on-surface-variant text-label-sm mb-6 shadow-lg backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          Ready for Analysis
        </motion.div>
        <h2 className="text-display-lg font-display-lg text-on-surface mb-4">Upload Patient Scan</h2>
        <p className="text-body-lg font-body-lg text-on-surface-variant">Initialize the DenseNet121 pipeline with Explainable AI.</p>
      </div>

      <div 
        className={`w-full relative rounded-3xl transition-all duration-500 ease-out flex flex-col items-center justify-center p-16 overflow-hidden ${
          isDragging 
            ? 'border-2 border-dashed border-primary bg-primary/10 shadow-[0_0_50px_-12px_rgba(138,235,255,0.3)]' 
            : file 
              ? 'border-2 border-solid border-outline-variant bg-surface/60 backdrop-blur-xl' 
              : 'border-2 border-dashed border-outline-variant bg-surface/40 hover:bg-surface/60 hover:border-outline backdrop-blur-sm'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center pointer-events-none"
            >
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                <div className={`relative w-full h-full rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center shadow-2xl transition-transform duration-300 ${isDragging ? 'scale-110 rotate-3' : ''}`}>
                  <UploadCloud className={`w-12 h-12 ${isDragging ? 'text-primary' : 'text-on-surface-variant'}`} />
                </div>
              </div>
              <p className="text-headline-md font-headline-md text-on-surface mb-3">Drag & drop X-ray</p>
              <p className="text-body-md font-body-md text-on-surface-variant mb-8">High-resolution DICOM, JPG, or PNG</p>
              
              <div className="pointer-events-auto">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-8 py-3 rounded-xl font-label-md transition-all border border-outline-variant hover:border-outline shadow-lg hover:shadow-xl"
                >
                  Browse Files
                </label>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center z-20"
            >
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-tertiary/20 rounded-full blur-xl" />
                <div className="relative w-full h-full rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center shadow-xl">
                  <FileImage className="w-10 h-10 text-tertiary" />
                </div>
              </div>
              <p className="text-headline-md font-headline-md text-on-surface truncate max-w-md mb-2">{file.name}</p>
              <p className="text-label-md font-label-md text-on-surface-variant mb-10">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>

              <div className="flex gap-4">
                <button
                  onClick={() => setFile(null)}
                  disabled={isUploading}
                  className="px-6 py-3 rounded-xl font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="relative group px-8 py-3 rounded-xl font-label-md font-bold text-on-primary bg-primary hover:bg-primary-fixed shadow-[0_0_30px_-5px_rgba(138,235,255,0.5)] transition-all flex items-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed overflow-hidden"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-on-primary" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Scan className="w-5 h-5" />
                      Run AI Analysis
                    </>
                  )}
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Futuristic Scanning Animation */}
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 overflow-hidden">
             {/* The scanning laser line */}
             <div className="absolute top-0 left-0 right-0 h-1 bg-primary shadow-[0_0_20px_5px_rgba(138,235,255,0.6)] animate-scan z-0" />
             
             <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel px-8 py-6 rounded-2xl flex flex-col items-center z-30 border-primary/30 shadow-[0_0_50px_rgba(138,235,255,0.1)]"
             >
                <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-surface-container rounded-full" />
                  <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-headline-md font-headline-md text-on-surface mb-2">Analyzing X-Ray</h3>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-label-md font-label-md text-primary animate-pulse">Running DenseNet121 Layers...</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">Generating Grad-CAM Heatmap</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">Requesting Llama-3 Report</p>
                </div>
             </motion.div>
          </div>
        )}
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 px-6 py-4 bg-error-container/20 border border-error-container rounded-xl flex items-center gap-3 shadow-lg"
        >
          <div className="w-10 h-10 rounded-full bg-error-container/40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-error"></div>
          </div>
          <div>
            <h4 className="text-label-md font-label-md text-error">Analysis Failed</h4>
            <p className="text-body-md font-body-md text-on-error-container">{error}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UploadZone;
