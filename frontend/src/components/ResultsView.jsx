import React from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, Activity, ScanFace, FileText, Share2, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const ResultsView = ({ result, onReset }) => {
  if (!result) return null;

  const isPneumonia = result.predicted_class === 'Pneumonia';
  const confidencePercent = (result.confidence * 100).toFixed(1);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onReset}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          New Analysis
        </button>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900/50 text-xs font-mono text-slate-400 border border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ID: {result.id}
          </div>
          <button className="p-2 rounded-xl bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-xl bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Diagnostic Images */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div variants={item} className="glass-panel p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                <ScanFace className="w-6 h-6 text-cyan-400" />
                Imaging Diagnostics
              </h3>
              <span className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
                DenseNet121
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pl-1">
                  <p className="text-sm font-semibold text-slate-300">Original X-Ray</p>
                </div>
                <div className="aspect-square rounded-2xl bg-slate-950 border border-white/10 overflow-hidden relative group shadow-inner">
                  <img 
                    src={result.original_image_url} 
                    alt="Original" 
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-xs font-mono text-cyan-400">RAW DICOM/JPG</span>
                  </div>
                </div>
              </div>
              
              {/* Grad-CAM */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pl-1">
                  <p className="text-sm font-semibold text-slate-300">Grad-CAM Heatmap</p>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">
                    XAI
                  </span>
                </div>
                <div className="aspect-square rounded-2xl bg-slate-950 border border-white/10 overflow-hidden relative group shadow-inner">
                  <img 
                    src={result.heatmap_image_url} 
                    alt="Heatmap" 
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Subtle scanning overlay effect on hover */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(6,182,212,0.1)_50%,transparent_100%)] bg-[length:100%_200%] animate-[scan_3s_linear_infinite] opacity-0 group-hover:opacity-100 pointer-events-none" />
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-white/5 flex gap-3">
              <Activity className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <p className="text-sm text-slate-400 leading-relaxed">
                <strong className="text-slate-200">Explainable AI:</strong> The heatmap highlights the exact regions the DenseNet121 model focused on to make its prediction. Warmer colors (red/yellow) indicate higher importance for the diagnosis.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Results & Report */}
        <div className="lg:col-span-5 space-y-6">
          {/* Prediction Card */}
          <motion.div 
            variants={item}
            className={`p-8 rounded-3xl border relative overflow-hidden shadow-2xl ${
              isPneumonia 
                ? 'bg-gradient-to-br from-rose-950/40 to-slate-900 border-rose-500/30 shadow-[0_0_40px_-15px_rgba(244,63,94,0.3)]' 
                : 'bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/30 shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]'
            }`}
          >
            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] pointer-events-none ${
              isPneumonia ? 'bg-rose-500/30' : 'bg-emerald-500/30'
            }`} />

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">AI Diagnosis</p>
                <h2 className={`text-4xl font-extrabold flex items-center gap-3 tracking-tight ${
                  isPneumonia ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {result.predicted_class}
                  {isPneumonia ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8" />
                  )}
                </h2>
              </div>
            </div>
            
            <div className="space-y-3 mt-8 relative z-10">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-300">Model Confidence</span>
                <span className="text-white font-mono text-lg">{confidencePercent}%</span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10 shadow-inner relative">
                {/* Confidence Bar Animation */}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${confidencePercent}%` }}
                  transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                  className={`absolute top-0 left-0 bottom-0 ${
                    isPneumonia 
                      ? 'bg-gradient-to-r from-rose-600 to-rose-400' 
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                  }`}
                />
                {/* Glossy overlay on bar */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>

          {/* LLM Report Card */}
          <motion.div 
            variants={item}
            className="glass-panel p-8 rounded-3xl flex-1 h-[450px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Clinical Report
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full">
                Llama 3
              </span>
            </div>

            <div className="flex-1 bg-slate-950/80 rounded-2xl p-6 border border-white/5 overflow-y-auto custom-scrollbar shadow-inner relative group">
              {result.report ? (
                <div className="prose prose-invert prose-slate max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-headings:text-white prose-headings:font-bold prose-strong:text-cyan-400">
                  <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-slate-300">
                    {result.report}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                  <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
                  <p className="text-sm font-medium animate-pulse">Generating clinical report...</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsView;
