import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import UploadZone from './components/UploadZone';
import ResultsView from './components/ResultsView';
import HistoryTab from './components/HistoryTab';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [currentResult, setCurrentResult] = useState(null);

  const handleUploadSuccess = (data) => {
    setCurrentResult(data);
  };

  const handleReset = () => {
    setCurrentResult(null);
  };

  return (
    <div className="min-h-screen font-body-md text-body-md antialiased overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Navigation (Web) */}
      <nav className="hidden md:flex bg-background/80 dark:bg-background/80 backdrop-blur-xl docked full-width top-0 border-b border-white/10 shadow-sm fixed left-0 w-full z-50 justify-between items-center px-container-padding h-16 mx-auto">
        <div className="flex items-center gap-8">
          <button onClick={() => setActiveTab('landing')} className="text-headline-md font-headline-md font-bold tracking-tighter text-primary dark:text-primary">
            DiagnosAI
          </button>
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('analyze')}
              className={`${activeTab === 'analyze' ? 'text-primary dark:text-primary border-b-2 border-primary pb-1 opacity-80 scale-95' : 'text-on-surface-variant dark:text-on-surface-variant hover:text-primary hover:bg-white/5'} transition-all duration-300 text-label-md font-label-md px-2 py-1 rounded`}
            >
              Diagnostic Hub
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`${activeTab === 'history' ? 'text-primary dark:text-primary border-b-2 border-primary pb-1 opacity-80 scale-95' : 'text-on-surface-variant dark:text-on-surface-variant hover:text-primary hover:bg-white/5'} transition-all duration-300 text-label-md font-label-md px-2 py-1 rounded`}
            >
              History
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-white/5 transition-all duration-300">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-white/5 transition-all duration-300">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-white/10">
            <img alt="Chief Radiologist Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBm4YYJs4xbtfR07237W0T__S8fVJnuda0M9qsaCjdA3Jw5ztqBoHIlRrOEZqXCLq4oPLqohgHkjktwzFbEFoV9xluedtqQLDx9VfHF_-fFoXISK30MVGIZn_HdWYkIvUmcb7uxtXU2bGVra18Ekb9jR-9oj_Grkd00eJj5TeraOfwf_m7ic0whU3BOS_jYjY-TqYWAAk7yHAQlpwRVaI_AUuKG4rVpNcgYufci1d3C4HZhR_6yJaDnQ84dihn8nVwfAN0q1viWkph9" />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-24 pb-16 px-margin-mobile md:px-container-padding max-w-max-width mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <LandingPage onStart={() => setActiveTab('analyze')} />
            </motion.div>
          )}

          {activeTab === 'analyze' && (
            <motion.div 
              key="analyze"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              {!currentResult ? (
                <UploadZone onUploadSuccess={handleUploadSuccess} />
              ) : (
                <ResultsView result={currentResult} onReset={handleReset} />
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <HistoryTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
