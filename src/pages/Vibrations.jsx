import { useState, useEffect, useRef, useCallback } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  Activity,
  PlugZap,
  Play,
  Cpu,
  Database,
  BrainCircuit,
  Users,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  RotateCcw,
  Table,
  Zap,
  Radio,
  TrendingUp,
  Settings,
  Eye,
  EyeOff,
  Download,
  Upload,
} from "lucide-react";

// Import API and utilities
import { api, BUFFER_CONFIG } from "../config/api";
import {
  formatSampleCounts,
  formatPrediction,
  formatMetrics,
  isConfidentMatch,
} from "../utils/formatData";
import {
  FootstepEventDetector,
  LIFNeuron,
  DETECTION_CONFIG,
  mean,
  std,
} from "../utils/signalProcessing";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

// Binary classification labels
const SAMPLE_MODES = [
  { value: "HOME", label: "🏠 HOME Sample", color: "from-green-500 to-emerald-500" },
  { value: "INTRUDER", label: "🚨 INTRUDER Sample", color: "from-red-500 to-orange-500" }
];

// Chart options for better performance
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 },
  scales: {
    x: { display: false },
    y: {
      grid: { color: 'rgba(255,255,255,0.1)' },
      ticks: { color: '#9ca3af' }
    }
  },
  plugins: {
    legend: { display: false }
  }
};

const fftChartOptions = {
  ...chartOptions,
  scales: {
    x: {
      display: true,
      title: { display: true, text: 'Frequency (Hz)', color: '#9ca3af' },
      ticks: { color: '#9ca3af' }
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.1)' },
      ticks: { color: '#9ca3af' },
      title: { display: true, text: 'Magnitude', color: '#9ca3af' }
    }
  }
};

function Vibrations() {
  // ============== CORE STATE ==============
  const [sampleMode, setSampleMode] = useState("HOME"); // "HOME" or "INTRUDER"
  const [status, setStatus] = useState("Idle — Connect serial to begin");
  const [prediction, setPrediction] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sampleCounts, setSampleCounts] = useState({});
  const [modelTrained, setModelTrained] = useState(false);
  const [trainingMetrics, setTrainingMetrics] = useState(null);

  // ============== LOADING STATES ==============
  const [isSaving, setIsSaving] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // ============== DATASET MANAGER ==============
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [showDatasetManager, setShowDatasetManager] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef(null);

  // ============== SIGNAL DATA ==============
  const [amplifiedData, setAmplifiedData] = useState([]);
  const [fftData, setFftData] = useState({ frequencies: [], magnitudes: [] });
  const [lifData, setLifData] = useState([]);
  const [spikeMarkers, setSpikeMarkers] = useState([]);

  // ============== EVENT DETECTION STATE ==============
  const [validatedEvents, setValidatedEvents] = useState([]);
  const [currentEventInfo, setCurrentEventInfo] = useState(null);
  const [detectionStats, setDetectionStats] = useState({
    totalSamples: 0,
    eventsDetected: 0,
    eventsRejected: 0,
    lastRejectionReason: null
  });

  // ============== MODE FLAGS ==============
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [livePredictEnabled, setLivePredictEnabled] = useState(false);

  // ============== TOASTS ==============
  const [toasts, setToasts] = useState([]);

  // ============== REFS ==============
  const portRef = useRef(null);
  const readerRef = useRef(null);
  const stopRef = useRef(false);
  const alarmRef = useRef(null);
  const detectorRef = useRef(null);
  const lifNeuronRef = useRef(null);
  const lastSaveTimeRef = useRef(0);
  const lineBufferRef = useRef("");

  // ============== INITIALIZE DETECTOR & LIF ==============
  useEffect(() => {
    detectorRef.current = new FootstepEventDetector(DETECTION_CONFIG);
    lifNeuronRef.current = new LIFNeuron(0.020, 0.025, 0.010, 200);
  }, []);

  // ============== TOAST SYSTEM ==============
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ============== SERIAL SUPPORT CHECK ==============
  useEffect(() => {
    if (!("serial" in navigator)) {
      showToast("⚠ Web Serial API NOT supported. Use Chrome/Edge desktop.", "error");
    }
  }, [showToast]);

  // ============== FETCH STATUS ON MOUNT ==============
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // ============== CLEANUP ==============
  useEffect(() => {
    return () => {
      stopRef.current = true;
      readerRef.current?.cancel().catch(() => { });
      portRef.current?.close().catch(() => { });
    };
  }, []);

  // ============== API: FETCH STATUS ==============
  const fetchStatus = async () => {
    try {
      const result = await api.getStatus();
      setSampleCounts(result.samples_per_person || {});
      setModelTrained(result.model_status === 'Ready');
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  // ============== SERIAL: CONNECT ==============
  const connectSerial = async () => {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: BUFFER_CONFIG.BAUD_RATE });

      const decoder = new TextDecoderStream();
      port.readable.pipeTo(decoder.writable);
      const reader = decoder.readable.getReader();

      portRef.current = port;
      readerRef.current = reader;
      stopRef.current = false;

      // Reset detector
      detectorRef.current?.reset();
      lifNeuronRef.current?.reset();

      setIsConnected(true);
      setAmplifiedData([]);
      setLifData([]);
      setSpikeMarkers([]);
      setValidatedEvents([]);
      setDetectionStats({ totalSamples: 0, eventsDetected: 0, eventsRejected: 0, lastRejectionReason: null });
      setStatus(`🟢 Connected — Recording ${sampleMode} samples...`);

      readLoop(reader);
    } catch (err) {
      setStatus("❌ Failed to connect to serial port");
      showToast("❌ Serial connection failed", "error");
    }
  };

  // ============== SERIAL: DISCONNECT ==============
  const disconnectSerial = async () => {
    stopRef.current = true;
    await readerRef.current?.cancel().catch(() => { });
    await portRef.current?.close().catch(() => { });
    setIsConnected(false);
    setStatus("🔌 Disconnected");
  };

  // ============== SERIAL: READ LOOP ==============
  const readLoop = async (reader) => {
    while (!stopRef.current) {
      try {
        const { value, done } = await reader.read();
        if (done || !value) break;

        // Accumulate data and process complete lines
        lineBufferRef.current += value;
        const lines = lineBufferRef.current.split("\n");
        lineBufferRef.current = lines.pop() || "";

        for (const line of lines) {
          processSerialLine(line.trim());
        }
      } catch (err) {
        if (!stopRef.current) {
          console.error("Serial read error:", err);
        }
        break;
      }
    }
  };

  // ============== PROCESS SERIAL LINE ==============
  const processSerialLine = (line) => {
    if (!line) return;

    // Parse ESP32 format: "Raw:1958 Baseline:1906 Amplified:382 Peak:382"
    // Or simple number format
    let rawValue;

    const rawMatch = line.match(/Raw:(\d+)/);
    if (rawMatch) {
      rawValue = parseInt(rawMatch[1], 10);
    } else {
      rawValue = parseInt(line, 10);
    }

    if (isNaN(rawValue) || rawValue < 0 || rawValue > 4095) return;

    // Process through detector
    const detector = detectorRef.current;
    if (!detector) return;

    const result = detector.processSample(rawValue);
    const timestamp = performance.now() / 1000;

    // Update detection stats
    setDetectionStats(prev => ({
      ...prev,
      totalSamples: prev.totalSamples + 1
    }));

    // Update amplified signal graph
    setAmplifiedData(prev => {
      const newData = [...prev, { time: timestamp, value: result.amplified }];
      return newData.slice(-500); // Keep last 500 points
    });

    // Process through LIF neuron
    const lif = lifNeuronRef.current;
    if (lif && !result.isWarmup) {
      const normalizedInput = Math.abs(result.amplified) / 500; // Normalize
      const lifResult = lif.step(normalizedInput);

      setLifData(prev => {
        const newData = [...prev, { time: timestamp, membrane: lifResult.membrane }];
        return newData.slice(-500);
      });

      if (lifResult.spiked) {
        setSpikeMarkers(prev => {
          const newMarkers = [...prev, { time: timestamp, value: lifResult.membrane }];
          return newMarkers.slice(-50);
        });
      }
    }

    // Update status during warmup
    if (result.isWarmup) {
      setStatus(`🔄 Warming up... (${detector.warmupCount}/${DETECTION_CONFIG.WARMUP_THRESHOLD})`);
      return;
    }

    // Update current event info
    if (result.eventActive) {
      setCurrentEventInfo({
        length: result.eventLength,
        deviation: result.deviation,
        threshold: result.threshold
      });
      setStatus(`📊 Event active: ${result.eventLength} samples`);
    } else {
      setCurrentEventInfo(null);
      if (!result.event) {
        setStatus(`🟢 Monitoring — Threshold: ${result.threshold.toFixed(1)}`);
      }
    }

    // Handle detected event
    if (result.event) {
      handleValidatedEvent(result.event);
    }
  };

  // ============== HANDLE VALIDATED EVENT ==============
  const handleValidatedEvent = async (event) => {
    // Update FFT display
    setFftData({
      frequencies: event.frequencies.slice(0, 50),
      magnitudes: event.magnitudes.slice(0, 50)
    });

    // Add to validated events
    setValidatedEvents(prev => [...prev.slice(-9), event]);

    // Update stats
    setDetectionStats(prev => ({
      ...prev,
      eventsDetected: prev.eventsDetected + 1
    }));

    // Show toast
    const metrics = event.metrics;
    showToast(
      `✅ Footstep detected! SNR: ${metrics.snr.toFixed(1)}, Freq: ${metrics.domFreq.toFixed(0)}Hz`,
      'success'
    );

    setStatus(`✅ Event validated! Dom.Freq: ${metrics.domFreq.toFixed(1)}Hz, SNR: ${metrics.snr.toFixed(2)}`);

    // Auto-save if enabled
    if (autoSaveEnabled && personName.trim()) {
      await saveEventToBackend(event);
    }

    // Live predict if enabled and model trained
    if (livePredictEnabled && modelTrained) {
      await predictEvent(event);
    }
  };

  // ============== SAVE EVENT TO BACKEND ==============
  const saveEventToBackend = async (event) => {
    // Throttle: max 2 saves per second
    const now = Date.now();
    if (now - lastSaveTimeRef.current < 500) return;
    lastSaveTimeRef.current = now;

    const backendData = FootstepEventDetector.toBackendFormat(event);
    if (!backendData) return;

    try {
      const result = await api.saveTrainData(backendData, sampleMode);
      if (result.samples_per_person) {
        setSampleCounts(result.samples_per_person);
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  };

  // ============== PREDICT EVENT ==============
  const predictEvent = async (event) => {
    const backendData = FootstepEventDetector.toBackendFormat(event);
    if (!backendData) return;

    try {
      const result = await api.predict(backendData);
      const formatted = formatPrediction(result);

      setPrediction({ ...result, formatted });

      if (result.is_intruder) {
        alarmRef.current?.play();
        showToast(`🚨 INTRUDER: ${formatted.person} (${formatted.confidenceDisplay})`, 'error');
      } else if (result.confidence < 0.5) {
        showToast(`⚠ Low confidence: ${formatted.person} (${formatted.confidenceDisplay})`, 'warning');
      } else {
        showToast(`✅ ${formatted.person}: ${formatted.confidenceDisplay}`, 'success');
      }
    } catch (error) {
      console.error("Prediction failed:", error);
    }
  };

  // ============== MANUAL SAVE ==============
  const handleSaveTrainData = async () => {
    if (validatedEvents.length === 0) {
      return showToast("⚠ No validated events to save.", "warning");
    }

    setIsSaving(true);
    setStatus(`⬆ Uploading ${sampleMode} samples...`);

    try {
      let savedCount = 0;
      for (const event of validatedEvents) {
        const backendData = FootstepEventDetector.toBackendFormat(event);
        if (backendData) {
          await api.saveTrainData(backendData, sampleMode);
          savedCount++;
        }
      }

      await fetchStatus();
      setValidatedEvents([]);

      showToast(`✅ Saved ${savedCount} ${sampleMode} samples!`, 'success');
      setStatus(`✅ Saved ${savedCount} ${sampleMode} samples`);
    } catch (error) {
      showToast(`❌ Save failed: ${error.message}`, 'error');
      setStatus(`❌ Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ============== TRAIN MODEL ==============
  const handleTrainModel = async () => {
    setIsTraining(true);
    setStatus("🤖 Training binary classifier (HOME vs INTRUDER)...");

    try {
      const result = await api.trainModel(sampleMode);
      setModelTrained(true);

      if (result.metrics) {
        setTrainingMetrics(result.metrics);
        const accuracy = (result.metrics.accuracy * 100).toFixed(1);
        showToast(`🎯 Model trained! Accuracy: ${accuracy}%`, 'success');
        setStatus(`🎯 Binary classifier ready! Accuracy: ${accuracy}%`);
      } else {
        showToast('🎯 Model trained successfully!', 'success');
        setStatus("🎯 Binary classifier trained!");
      }

      await fetchStatus();
    } catch (error) {
      showToast(`❌ Training failed: ${error.message}`, 'error');
      setStatus(`❌ Training failed: ${error.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  // ============== MANUAL PREDICT ==============
  const handlePredict = async () => {
    if (validatedEvents.length === 0) {
      return showToast("⚠ No footstep events to predict.", "warning");
    }

    setIsPredicting(true);
    setStatus("🔍 Predicting identity...");

    const lastEvent = validatedEvents[validatedEvents.length - 1];
    const backendData = FootstepEventDetector.toBackendFormat(lastEvent);

    if (!backendData) {
      showToast("⚠ Invalid event data", "warning");
      setIsPredicting(false);
      return;
    }

    try {
      const result = await api.predict(backendData);
      const formatted = formatPrediction(result);

      setPrediction({ ...result, formatted });

      if (result.is_intruder) {
        alarmRef.current?.play();
        showToast(`🚨 INTRUDER ALERT! Confidence: ${formatted.confidenceDisplay}`, 'error');
        setStatus(`🚨 INTRUDER DETECTED!`);
      } else if (result.confidence < 0.5) {
        alarmRef.current?.play();
        showToast(`⚠ Low Confidence: ${formatted.person}`, 'warning');
        setStatus(`⚠ LOW CONFIDENCE: ${formatted.person} (${formatted.confidenceDisplay})`);
      } else {
        showToast(`✅ Family: ${formatted.person} (${formatted.confidenceDisplay})`, 'success');
        setStatus(`✅ IDENTIFIED: ${formatted.person} - ${formatted.confidenceDisplay}`);
      }
    } catch (error) {
      showToast('❌ Prediction failed!', 'error');
      setStatus(`❌ Prediction failed: ${error.message}`);
    } finally {
      setIsPredicting(false);
    }
  };

  // ============== RESET MODEL ==============
  const handleResetModel = async () => {
    if (!window.confirm('🚨 DELETE ALL data and models? This cannot be undone!')) return;

    setIsResetting(true);
    setStatus("🔄 Resetting model and data...");

    try {
      const result = await api.resetModel();

      setSampleCounts({});
      setModelTrained(false);
      setTrainingMetrics(null);
      setPrediction(null);
      setDatasetInfo(null);
      setValidatedEvents([]);

      const resetTime = result.reset_time?.slice(11, 19) || 'now';
      const deletedSamples = result.deleted?.samples || 0;

      showToast(`🚀 Reset complete! ${deletedSamples} samples deleted.`, 'success');
      setStatus(`✅ Reset at ${resetTime} (${deletedSamples} samples deleted)`);

      await fetchStatus();
    } catch (error) {
      showToast('❌ Reset failed!', 'error');
      setStatus(`❌ Reset failed: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  // ============== DATASET MANAGEMENT ==============
  const loadDatasetInfo = async () => {
    try {
      const result = await api.getDataset();
      setDatasetInfo(result);
    } catch (error) {
      setDatasetInfo(null);
      showToast('❌ Failed to load dataset info', 'error');
    }
  };

  const handleDeletePerson = async (name) => {
    if (!window.confirm(`🗑️ Delete all data for ${name}?`)) return;

    setIsDeleting(true);
    try {
      const result = await api.deletePerson(name);
      showToast(result.message || `✅ Deleted ${name}`, 'success');
      await loadDatasetInfo();
      await fetchStatus();
    } catch (error) {
      showToast(`❌ Delete failed: ${error.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (showDatasetManager) loadDatasetInfo();
  }, [showDatasetManager]);

  // ============== DATASET DOWNLOAD ==============
  const handleDownloadDataset = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/dataset/download');
      if (!response.ok) {
        throw new Error('No dataset available');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `synapsense_dataset_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('✅ Dataset downloaded!', 'success');
    } catch (error) {
      showToast(`❌ Download failed: ${error.message}`, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  // ============== DATASET UPLOAD ==============
  const handleUploadDataset = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      showToast('⚠ Please select a ZIP file', 'warning');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/dataset/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const result = await response.json();
      showToast(`✅ Imported ${result.imported_samples} samples!`, 'success');
      setSampleCounts(result.samples_per_person || {});
      await loadDatasetInfo();
      await fetchStatus();
    } catch (error) {
      showToast(`❌ Upload failed: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ============== CHART DATA ==============
  const amplifiedChartData = {
    labels: amplifiedData.map(d => d.time.toFixed(2)),
    datasets: [{
      label: "Amplified Signal",
      data: amplifiedData.map(d => d.value),
      borderColor: "#00eaff",
      backgroundColor: "rgba(0,234,255,0.15)",
      borderWidth: 1.5,
      pointRadius: 0,
      fill: true,
      tension: 0.1
    }]
  };

  const fftChartData = {
    labels: fftData.frequencies.map(f => f.toFixed(0)),
    datasets: [{
      label: "FFT Magnitude",
      data: fftData.magnitudes,
      backgroundColor: "rgba(139,92,246,0.6)",
      borderColor: "#8b5cf6",
      borderWidth: 1
    }]
  };

  const lifChartData = {
    labels: lifData.map(d => d.time.toFixed(2)),
    datasets: [
      {
        label: "Membrane Potential",
        data: lifData.map(d => d.membrane),
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.15)",
        borderWidth: 1.5,
        pointRadius: 0,
        fill: true
      },
      {
        label: "Threshold",
        data: lifData.map(() => 0.025),
        borderColor: "#ef4444",
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  // ============== RENDER ==============
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex gap-2 items-center">
          <Activity className="text-cyan-400" /> SynapSense Binary Classifier
        </h1>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
      </div>

      {/* SAMPLE MODE SELECTOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
          <label className="block text-sm text-gray-400 mb-2">Sample Mode (HOME vs INTRUDER):</label>
          <div className="flex gap-2">
            {SAMPLE_MODES.map(mode => (
              <button
                key={mode.value}
                onClick={() => setSampleMode(mode.value)}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${sampleMode === mode.value
                  ? `bg-gradient-to-r ${mode.color} shadow-lg`
                  : 'bg-gray-700 hover:bg-gray-600'
                  }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {sampleMode === 'HOME'
              ? '🏠 Recording footsteps from known home users'
              : '🚨 Recording footsteps from unknown/intruder sources'}
          </p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
          <label className="block text-sm text-gray-400 mb-2">Auto Modes:</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="w-5 h-5 rounded bg-gray-700 border-gray-600"
              />
              <span className="text-sm">Auto-Save Events</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={livePredictEnabled}
                onChange={(e) => setLivePredictEnabled(e.target.checked)}
                className="w-5 h-5 rounded bg-gray-700 border-gray-600"
                disabled={!modelTrained}
              />
              <span className={`text-sm ${!modelTrained ? 'text-gray-500' : ''}`}>Live Predict</span>
            </label>
          </div>
        </div>
      </div>

      {/* SAMPLE COUNTS GRID - BINARY */}
      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 text-cyan-400" />
            <span className="font-semibold">Training Data (Binary Classification)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs ${modelTrained ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {modelTrained ? '✓ Model Ready' : '⚠ Not Trained'}
            </span>
            <button onClick={fetchStatus} className="p-2 hover:bg-gray-700 rounded-lg transition">
              <RefreshCw className="w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* HOME Counter */}
          <div
            className={`p-4 rounded-xl transition ${sampleMode === 'HOME'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-500/20'
              : 'bg-gray-700/50'
              }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className={`w-5 ${sampleMode === 'HOME' ? 'text-white' : 'text-green-400'}`} />
              <span className="text-sm text-gray-300">HOME</span>
            </div>
            <div className="text-3xl font-bold">{sampleCounts.HOME || 0}</div>
            <div className="text-xs text-gray-400">samples</div>
          </div>

          {/* INTRUDER Counter */}
          <div
            className={`p-4 rounded-xl transition ${sampleMode === 'INTRUDER'
              ? 'bg-gradient-to-r from-red-600 to-orange-600 shadow-lg shadow-red-500/20'
              : 'bg-gray-700/50'
              }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`w-5 ${sampleMode === 'INTRUDER' ? 'text-white' : 'text-red-400'}`} />
              <span className="text-sm text-gray-300">INTRUDER</span>
            </div>
            <div className="text-3xl font-bold">{sampleCounts.INTRUDER || 0}</div>
            <div className="text-xs text-gray-400">samples</div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Total samples: {(sampleCounts.HOME || 0) + (sampleCounts.INTRUDER || 0)}</span>
            <span className={`${((sampleCounts.HOME || 0) >= 10 && (sampleCounts.INTRUDER || 0) >= 10) ? 'text-green-400' : 'text-yellow-400'}`}>
              {((sampleCounts.HOME || 0) >= 10 && (sampleCounts.INTRUDER || 0) >= 10)
                ? '✅ Ready to train!'
                : `⚠ Need ≥10 of each class`}
            </span>
          </div>
        </div>
      </div>      {/* CONTROL BUTTONS */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={isConnected ? disconnectSerial : connectSerial}
          className={`px-5 py-3 rounded-xl flex gap-2 items-center font-semibold transition-all ${isConnected
            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20'
            : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/20'
            }`}
        >
          <PlugZap className="w-5" />
          {isConnected ? "Disconnect" : "Connect Serial"}
        </button>

        <button
          onClick={handleSaveTrainData}
          disabled={isSaving || validatedEvents.length === 0}
          className="bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3 rounded-xl flex gap-2 items-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/20"
        >
          {isSaving ? <RefreshCw className="animate-spin w-5" /> : <Database className="w-5" />}
          Save ({validatedEvents.length})
        </button>

        <button
          onClick={handleTrainModel}
          disabled={isTraining}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-3 rounded-xl flex gap-2 items-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg shadow-yellow-500/20"
        >
          {isTraining ? <RefreshCw className="animate-spin w-5" /> : <BrainCircuit className="w-5" />}
          Train Model
        </button>

        <button
          onClick={handlePredict}
          disabled={isPredicting || validatedEvents.length === 0 || !modelTrained}
          className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 rounded-xl flex gap-2 items-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/20"
        >
          {isPredicting ? <RefreshCw className="animate-spin w-5" /> : <Play className="w-5" />}
          Predict
        </button>
      </div>

      {/* STATUS BAR */}
      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 text-cyan-400" />
            <span className="font-medium">{status}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Samples: {detectionStats.totalSamples}</span>
            <span className="text-green-400">Events: {detectionStats.eventsDetected}</span>
            {currentEventInfo && (
              <span className="text-yellow-400 animate-pulse">
                Recording: {currentEventInfo.length} samples
              </span>
            )}
          </div>
        </div>
      </div>

      {/* PREDICTION RESULT */}
      {prediction && prediction.formatted && (
        <div className={`mb-6 p-5 rounded-xl border-2 transition-all ${prediction.is_intruder
          ? 'bg-red-900/50 border-red-500 shadow-lg shadow-red-500/20'
          : prediction.confidence >= 0.5
            ? 'bg-green-900/50 border-green-500 shadow-lg shadow-green-500/20'
            : 'bg-yellow-900/50 border-yellow-500 shadow-lg shadow-yellow-500/20'
          }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xl font-bold">
              {prediction.is_intruder ? '🚨 INTRUDER!' : prediction.confidence >= 0.5 ? '✅ FAMILY' : '⚠ UNCERTAIN'}
            </div>
            {prediction.alert && <span className="text-sm opacity-75">{prediction.alert}</span>}
          </div>
          <div className="text-4xl font-bold mb-2">{prediction.formatted.person}</div>
          <div className="text-xl mb-4">Confidence: {prediction.formatted.confidenceDisplay}</div>

          {prediction.probabilities && (
            <div className="space-y-2">
              {Object.entries(prediction.probabilities)
                .sort((a, b) => b[1] - a[1])
                .map(([name, prob]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="w-24 text-sm">{name}</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${name === prediction.formatted.person ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-gray-500'
                          }`}
                        style={{ width: `${prob * 100}%` }}
                      />
                    </div>
                    <span className="text-sm w-14 text-right">{(prob * 100).toFixed(1)}%</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TRAINING METRICS */}
      {trainingMetrics && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl border border-green-700">
          <div className="font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="w-5" /> Training Results
          </div>
          <div className="text-sm">{formatMetrics(trainingMetrics)}</div>
        </div>
      )}

      {/* VISUALIZATION GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Amplified Signal */}
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-5 text-cyan-400" />
            <span className="font-semibold">Amplified Vibration Signal</span>
          </div>
          <div className="h-48">
            <Line data={amplifiedChartData} options={chartOptions} />
          </div>
        </div>

        {/* FFT */}
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 text-purple-400" />
            <span className="font-semibold">FFT Spectrum (Last Event)</span>
          </div>
          <div className="h-48">
            {fftData.frequencies.length > 0 ? (
              <Bar data={fftChartData} options={fftChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Waiting for footstep event...
              </div>
            )}
          </div>
        </div>

        {/* LIF Neuron */}
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 text-green-400" />
            <span className="font-semibold">LIF Neuron Model (Membrane Potential)</span>
            <span className="text-xs text-gray-400 ml-auto">
              Spikes: {spikeMarkers.length} | Rate: {lifNeuronRef.current?.getSpikeRate().toFixed(1) || 0} Hz
            </span>
          </div>
          <div className="h-40">
            <Line data={lifChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* RESET & DATASET MANAGER */}
      <div className="bg-gray-800/50 p-4 rounded-xl border border-red-900/30 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <button
            onClick={handleResetModel}
            disabled={isResetting}
            className="bg-gradient-to-r from-red-500 to-red-700 px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
            style={{ boxShadow: '0 4px 15px rgba(255, 68, 68, 0.3)' }}
          >
            {isResetting ? <RefreshCw className="animate-spin w-5" /> : <RotateCcw className="w-5" />}
            🚀 Reset All
          </button>

          <button
            onClick={() => setShowDatasetManager(!showDatasetManager)}
            className="bg-gray-700 px-5 py-3 rounded-xl flex gap-2 items-center hover:bg-gray-600 transition"
          >
            <Table className="w-5" />
            {showDatasetManager ? 'Hide' : 'Show'} Dataset Manager
          </button>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="bg-gray-700 px-5 py-3 rounded-xl flex gap-2 items-center hover:bg-gray-600 transition ml-auto"
          >
            <Settings className="w-5" />
            {showAdvanced ? <EyeOff className="w-4" /> : <Eye className="w-4" />}
          </button>
        </div>

        {/* Dataset Manager Panel */}
        {showDatasetManager && (
          <div className="bg-gray-900/50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Database className="w-5" /> Dataset Manager
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadDataset}
                  disabled={isDownloading}
                  className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg flex items-center gap-1 disabled:opacity-50"
                >
                  {isDownloading ? <RefreshCw className="w-4 animate-spin" /> : '⬇️'} Download
                </button>
                <label className="text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer">
                  {isUploading ? <RefreshCw className="w-4 animate-spin" /> : '⬆️'} Upload
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".zip"
                    onChange={handleUploadDataset}
                    className="hidden"
                  />
                </label>
                <button onClick={loadDatasetInfo} className="text-sm bg-gray-700 px-3 py-1 rounded-lg hover:bg-gray-600 flex items-center gap-1">
                  <RefreshCw className="w-4" /> Refresh
                </button>
              </div>
            </div>

            {datasetInfo ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-3 text-gray-400">Class</th>
                        <th className="text-left p-3 text-gray-400">Type</th>
                        <th className="text-left p-3 text-gray-400">Samples</th>
                        <th className="text-left p-3 text-gray-400">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datasetInfo.persons?.map((person) => (
                        <tr key={person.name} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-sm ${person.name === 'HOME' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                              {person.name === 'HOME' ? '🏠' : '🚨'} {person.name}
                            </span>
                          </td>
                          <td className="p-3 text-gray-400">{person.type || person.name}</td>
                          <td className="p-3 font-bold">{person.samples}</td>
                          <td className="p-3">
                            <button
                              onClick={() => handleDeletePerson(person.name)}
                              disabled={isDeleting || person.samples === 0}
                              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full text-sm flex items-center gap-1 disabled:opacity-50 transition"
                            >
                              <Trash2 className="w-4" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-gray-400 flex flex-wrap gap-4">
                  <span>📊 Total: <strong className="text-white">{datasetInfo.total_samples || 0}</strong> samples</span>
                  <span>🤖 Model: <strong className={datasetInfo.model_status === 'trained' ? 'text-green-400' : 'text-yellow-400'}>
                    {datasetInfo.model_status || 'not trained'}
                  </strong></span>
                  {datasetInfo.model_accuracy && (
                    <span>🎯 Accuracy: <strong className="text-cyan-400">{(datasetInfo.model_accuracy * 100).toFixed(1)}%</strong></span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-4">Loading...</div>
            )}
          </div>
        )}

        {/* Advanced Settings Panel */}
        {showAdvanced && (
          <div className="bg-gray-900/50 p-4 rounded-xl mt-4">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Settings className="w-5" /> Detection Parameters
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-gray-400">Min Samples</div>
                <div className="font-bold">{DETECTION_CONFIG.MIN_SAMPLES}</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-gray-400">Min SNR</div>
                <div className="font-bold">{DETECTION_CONFIG.MIN_SNR}</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-gray-400">Freq Range</div>
                <div className="font-bold">{DETECTION_CONFIG.MIN_DOMINANT_FREQ}-{DETECTION_CONFIG.MAX_DOMINANT_FREQ} Hz</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-gray-400">Gain</div>
                <div className="font-bold">{DETECTION_CONFIG.GAIN}x</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AUDIO */}
      <audio ref={alarmRef} src="/alarm.mp3" preload="auto" />

      {/* TOAST NOTIFICATIONS */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 cursor-pointer transition-all hover:scale-105 animate-slide-in ${toast.type === 'error' ? 'bg-red-600' :
              toast.type === 'warning' ? 'bg-yellow-600' : 'bg-green-600'
              }`}
          >
            <span>{toast.message}</span>
            <button className="ml-2 opacity-70 hover:opacity-100">✕</button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default Vibrations;
