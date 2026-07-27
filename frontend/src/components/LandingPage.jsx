import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const LandingPage = ({ onStart }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    // Reveal Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // Three.js DNA Model
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = ''; // Clear previous if any
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const dnaGroup = new THREE.Group();
    
    // DNA parameters
    const numBasePairs = 40;
    const radius = 2.5;
    const spacing = 0.6;
    const twistRate = 0.25;

    // Geometries & Materials
    const sphereGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const tubeGeometry = new THREE.CylinderGeometry(0.06, 0.06, radius * 2, 8);
    
    const cyanMaterial = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const emeraldMaterial = new THREE.MeshBasicMaterial({ color: 0x68f5b8 });
    const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });

    for (let i = 0; i < numBasePairs; i++) {
        const y = (i - numBasePairs / 2) * spacing;
        const angle = i * twistRate;

        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        
        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;

        // Phosphate backbone nodes
        const node1 = new THREE.Mesh(sphereGeometry, cyanMaterial);
        node1.position.set(x1, y, z1);
        dnaGroup.add(node1);

        const node2 = new THREE.Mesh(sphereGeometry, emeraldMaterial);
        node2.position.set(x2, y, z2);
        dnaGroup.add(node2);

        // Connecting hydrogen bonds (tube)
        const connection = new THREE.Mesh(tubeGeometry, tubeMaterial);
        connection.position.set(0, y, 0);
        connection.rotation.z = Math.PI / 2;
        connection.rotation.y = -angle;
        dnaGroup.add(connection);
    }

    scene.add(dnaGroup);

    // Setup camera and lighting
    camera.position.z = 18;
    camera.position.y = 0;

    // Animation Loop
    let animationFrameId;
    const animate = function () {
        animationFrameId = requestAnimationFrame(animate);
        dnaGroup.rotation.y += 0.01;
        dnaGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
        renderer.render(scene, camera);
    };
    
    animate();

    // Handle Resize
    const handleResize = () => {
        if (container) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full min-h-[80vh] flex flex-col lg:flex-row items-center justify-between gap-gutter mb-32 reveal">
        {/* Text Content */}
        <div className="w-full lg:w-1/2 z-10 flex flex-col gap-6">
          <h1 className="text-display-lg font-display-lg text-on-surface">
            <span className="text-gradient">Next-Gen AI</span><br />
            Medical Intelligence
          </h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-xl">
            Empowering clinical decision support with multi-modal intelligence: precision imaging, predictive modeling, and automated reporting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button onClick={onStart} className="bg-primary text-on-primary px-6 py-3 rounded hover:bg-primary-container transition-colors text-label-md font-label-md font-bold flex items-center justify-center gap-2">
              Start Diagnosis<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
            <div>
              <div className="text-headline-md font-headline-md text-on-surface">99.8%</div>
              <div className="text-label-sm font-label-sm text-on-surface-variant">Diagnostic Accuracy</div>
            </div>
            <div>
              <div className="text-headline-md font-headline-md text-on-surface">0.4s</div>
              <div className="text-label-sm font-label-sm text-on-surface-variant">Processing Time</div>
            </div>
            <div>
              <div className="text-headline-md font-headline-md text-on-surface">3K+</div>
              <div className="text-label-sm font-label-sm text-on-surface-variant">Scans Analysed</div>
            </div>
          </div>
        </div>
        {/* 3D Interactive Visual */}
        <div className="w-full lg:w-1/2 h-[500px] lg:h-[700px] relative rounded-xl overflow-hidden glass-panel flex items-center justify-center">
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <span className="bg-tertiary-container/20 text-tertiary px-2 py-1 rounded text-[10px] font-mono border border-tertiary/30 uppercase">Live Analysis</span>
          </div>
          {/* 3D Scene Container */}
          <div className="absolute inset-0 z-10 w-full h-full min-h-[500px]" id="dna-container" ref={containerRef}></div>
          {/* Overlay UI elements to make it look like a dashboard */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between">
            <div className="glass-panel p-3 rounded lg w-1/3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-label-sm font-label-sm text-on-surface-variant">Neural Net Status</span>
                <span className="text-primary text-[10px]">Active</span>
              </div>
              <div className="h-1 bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Objectives Section (Bento Grid) */}
      <section className="mb-32 reveal">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-headline-lg font-headline-lg text-on-surface mb-4">Multi-Modal Diagnostic Capabilities</h2>
          <p className="text-body-md font-body-md text-on-surface-variant max-w-2xl">
            Our platform integrates advanced neural architectures to provide a comprehensive, transparent, and actionable diagnostic view.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Feature 1: Medical Image Analysis (Large Card) */}
          <div className="glass-panel rounded-xl p-6 lg:col-span-2 lg:row-span-1 relative overflow-hidden group transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(138,235,255,0.3)] hover:border-primary/50">
            <div className="scan-line"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-surface-container rounded-lg border border-white/5">
                  <span className="material-symbols-outlined text-primary text-[32px]">medical_services</span>
                </div>
                <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-label-sm font-label-sm">Core Module</span>
              </div>
              <div>
                <h3 className="text-headline-md font-headline-md text-on-surface mb-2">Medical Image Analysis</h3>
                <p className="text-body-md font-body-md text-on-surface-variant max-w-lg">
                  High-precision neural architectures for radiographic and pathological imaging, detecting micro-anomalies with sub-millimeter accuracy.
                </p>
              </div>
            </div>
            {/* Decorative scan lines */}
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #8aebff 2px, #8aebff 4px)', WebkitMaskImage: 'linear-gradient(to top left, black, transparent)' }}></div>
          </div>

          {/* Feature 2: Disease Prediction */}
          <div className="glass-panel rounded-xl p-6 relative overflow-hidden group transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(138,235,255,0.3)] hover:border-primary/50">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="p-3 bg-surface-container rounded-lg border border-white/5 w-fit">
                <span className="material-symbols-outlined text-secondary text-[32px]">query_stats</span>
              </div>
              <div>
                <h3 className="text-headline-md font-headline-md text-on-surface mb-2">Disease Prediction</h3>
                <p className="text-body-md font-body-md text-on-surface-variant">
                  Deep learning models trained on vast clinical datasets for early intervention and risk stratification.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3: Explainable AI */}
          <div className="glass-panel rounded-xl p-6 relative overflow-hidden group transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(138,235,255,0.3)] hover:border-primary/50">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="p-3 bg-surface-container rounded-lg border border-white/5 w-fit">
                <span className="material-symbols-outlined text-tertiary text-[32px]">visibility</span>
              </div>
              <div>
                <h3 className="text-headline-md font-headline-md text-on-surface mb-2">Explainable AI</h3>
                <p className="text-body-md font-body-md text-on-surface-variant">
                  Grad-CAM heatmap overlays providing visual transparency and reasoning for all AI-generated predictions.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 4: LLM Clinical Reports (Wide Card) */}
          <div className="glass-panel rounded-xl p-6 lg:col-span-2 relative overflow-hidden flex flex-col sm:flex-row gap-6 items-center group transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(138,235,255,0.3)] hover:border-primary/50">
            <div className="flex-1">
              <div className="p-3 bg-surface-container rounded-lg border border-white/5 w-fit mb-4">
                <span className="material-symbols-outlined text-primary-fixed-dim text-[32px]">description</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface mb-2">LLM Clinical Reports</h3>
              <p className="text-body-md font-body-md text-on-surface-variant">
                Automated generation of structured, professional medical reports using state-of-the-art language models tailored for medical terminology.
              </p>
            </div>
            {/* Code snippet visual */}
            <div className="w-full sm:w-[40%] h-full bg-[#060e20] rounded border border-white/10 p-4 font-label-sm text-label-sm text-outline overflow-hidden relative">
              <div className="text-primary-fixed-dim mb-2"><div><br /></div>Generating Report...</div>
              <div className="opacity-70">
                &gt; ANALYSIS: Patient scan #4892<br />
                &gt; MODEL: LuminaMed-Path-v4<br />
                &gt; FINDINGS: No acute cardiopulmonary process.<br />
                &gt; CONFIDENCE: 99.4%
              </div>
              <div className="absolute bottom-4 right-4 flex gap-1">
                <span className="w-1 h-3 bg-primary animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supporting Profile Section */}
      <section className="mb-24 reveal">
        <div className="glass-panel rounded-2xl overflow-hidden flex flex-col lg:flex-row border border-white/10">
          <div className="w-full lg:w-1/2 h-[400px] lg:h-auto relative">
            <img alt="Clinical Expert" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKqj6mzmxNsIChHk2fKx16UmrRT0T6AIw80ZRRF7QJbIcCfId0Tf7LgOmf1cLxF2FjO15KpHjPnEc8NeM7X7Ztmi883Rd5pcBbzMOpfHcsy7CeL_way7zP5Aj-O8OgSr3NvWE-kR8kWD36RdDwk5o8Ixy1Yg9jTs0s_fU-8pKD6YNNPXVYCFroAYUhk5qY0WTvelRQD__-kfGH7SfPyV_dLNbi38KLyypkqjr2ruijVll40D3nyBBlp3TgBTMtHddekwN6cGDuwb0r" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0b1326] lg:bg-gradient-to-l opacity-80 lg:opacity-100 hidden lg:block"></div>
          </div>
          <div className="w-full lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
            <span className="text-label-md font-label-md text-primary mb-4 tracking-widest uppercase">Clinical Leadership</span>
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-6">Designed by clinicians, built for precision.</h2>
            <p className="text-body-lg font-body-lg text-on-surface-variant mb-8">"The DiagnosAI platform acts not as a replacement, but as an tireless, hyper-vigilant partner. It catches the micro-calcifications the tired eye might miss, and structures data in a way that respects clinical workflow."</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-variant overflow-hidden">
                <img alt="Dr. Sarah Chen" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBegNhRwOoBNZG8PfIkppflCgs_Az5xNKM0zK6DkKOZiFQ5W8SiEjJau0ubr1DEy8CK9LcVwO8vvQs69WMDH0KTxTAbu8tXla-XXA6_8jcss-IJyEOR041PGkNss9vpzAEKZprJixK7ydSsz0UM-e7_uYMLw1Dtr6sYFZeidCIINZS3HBC3rNueORsmu-fiXFJ7chx2YtI6VD7hNKCxJc93V08HOe7XBpKeDsNxQPi2E7HdNIF2KVE3aJYndSG6LNVHAXGVfKCrZXNU" />
              </div>
              <div>
                <div className="text-body-md font-body-md text-on-surface font-semibold">Dr. Sarah Chen, MD PhD</div>
                <div className="text-label-sm font-label-sm text-on-surface-variant">Chief Medical Officer, DiagnosAI</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
