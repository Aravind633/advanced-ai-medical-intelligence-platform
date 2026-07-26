import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Calendar, AlertTriangle, CheckCircle2, ChevronRight, ScanFace, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HistoryTab = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse">Loading patient history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center text-center py-32 px-4 max-w-2xl mx-auto"
      >
        <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">
          <Clock className="w-10 h-10 text-slate-600" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">No Diagnostic History</h3>
        <p className="text-slate-400 text-lg">Analyses performed in the Diagnostic Studio will automatically be securely archived here.</p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
          <Clock className="w-8 h-8 text-cyan-400" />
          Diagnostic Archive
        </h2>
        <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-full text-sm text-slate-400">
          <span className="text-white font-semibold">{history.length}</span> Records Found
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {history.map((record) => {
          const isPneumonia = record.predicted_class === 'Pneumonia';
          const date = new Date(record.timestamp).toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric' 
          });
          const time = new Date(record.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
          });
          const confidencePercent = (record.confidence * 100).toFixed(1);

          return (
            <motion.div 
              key={record.id}
              variants={item}
              whileHover={{ y: -5 }}
              className="glass-card rounded-2xl overflow-hidden group cursor-pointer flex flex-col"
              onClick={() => setSelectedRecord(selectedRecord?.id === record.id ? null : record)}
            >
              {/* Card Header (Images) */}
              <div className="h-40 bg-slate-950 relative overflow-hidden flex">
                <div className="w-1/2 relative border-r border-slate-800">
                  <img src={record.original_image_url} alt="Original" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded">X-Ray</span>
                </div>
                <div className="w-1/2 relative">
                  <img src={record.heatmap_image_url} alt="Heatmap" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <span className="absolute bottom-2 right-2 text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/20">Grad-CAM</span>
                </div>
                
                {/* Floating Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 ${
                  isPneumonia ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {isPneumonia ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {record.predicted_class}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="truncate pr-4">
                    <p className="text-white font-medium truncate" title={record.file_name}>{record.file_name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {date} &bull; {time}
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-400">Confidence</span>
                    <span className="text-white">{confidencePercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isPneumonia ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${confidencePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Expandable Report Section */}
              <AnimatePresence>
                {selectedRecord?.id === record.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 bg-slate-900/80 overflow-hidden"
                  >
                    <div className="p-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Clinical Report Synopsis
                      </h4>
                      <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 max-h-48 overflow-y-auto custom-scrollbar shadow-inner">
                        <pre className="whitespace-pre-wrap font-sans text-slate-300 text-[13px] leading-relaxed">
                          {record.report}
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* View Details Hint */}
              <div className="py-3 px-5 border-t border-white/5 flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-cyan-400 transition-colors bg-slate-900/30">
                {selectedRecord?.id === record.id ? 'Close details' : 'View full diagnostic report'}
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedRecord?.id === record.id ? 'rotate-90' : ''}`} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default HistoryTab;
