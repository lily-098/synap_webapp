import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 DEVELOPMENT MODE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const DEV_MODE = import.meta.env.DEV || true; // Auto-detects dev environment
const DEV_CONFIG = {
  showDebugPanel: true,        // Show floating debug panel
  showTranscript: true,        // Show real-time transcript
  logToConsole: true,          // Detailed console logging
  mockSpeechSynthesis: false,  // Use mock TTS (no audio)
  mockSpeechRecognition: false, // Use text input instead of mic
  showCommandHistory: true,    // Show command history in panel
  maxHistoryItems: 10,         // Max items in history
  showAnswerPanel: true,       // Show floating answer panel
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📚 SYNAPSENSE KNOWLEDGE BASE (Dynamic Q&A System)
// ═══════════════════════════════════════════════════════════════════════════════
const KNOWLEDGE_BASE = [
  {
    topic: "what_is_synapsense",
    keywords: ["what", "synapsense", "what is", "explain", "tell me about", "describe", "introduction", "overview"],
    answer: "SynapSense is a cutting-edge vibration-based detection and monitoring system that uses advanced seismic sensor technology to provide comprehensive security and surveillance capabilities. It analyzes ground vibrations with military-grade precision to detect, classify, and alert you to various types of movement and activity in real-time.",
    shortAnswer: "SynapSense is an advanced vibration-based security system using seismic sensors for real-time threat detection."
  },
  {
    topic: "how_it_works",
    keywords: ["how", "work", "works", "working", "function", "functions", "operate", "operation", "process", "mechanism"],
    answer: "SynapSense works by using high-sensitivity geophone sensors that detect micro-vibrations in the ground. The system processes thousands of data points per second using Fast Fourier Transform (FFT) analysis and machine learning algorithms. It distinguishes between harmless environmental noise and genuine security concerns, providing real-time alerts within milliseconds.",
    shortAnswer: "It uses seismic sensors and FFT analysis with machine learning to detect and classify vibrations in real-time."
  },
  {
    topic: "accuracy",
    keywords: ["accuracy", "accurate", "precision", "reliable", "reliability", "false alarm", "false positive", "detection rate", "percentage", "how accurate"],
    answer: "SynapSense maintains a detection accuracy of 98.7% under normal operating conditions. The system uses multiple validation techniques including pattern recognition, frequency analysis, and amplitude threshold detection. Continuous machine learning improvements and regular calibration ensure consistent high accuracy with minimal false alarms.",
    shortAnswer: "SynapSense has 98.7% detection accuracy with minimal false alarms using ML-based validation."
  },
  {
    topic: "threats_detection",
    keywords: ["threat", "threats", "detect", "detection", "intruder", "intrusion", "security", "danger", "dangerous", "alert", "what can", "types", "classify"],
    answer: "SynapSense can detect and classify multiple types of vibration sources including human footsteps, animal movements, vehicle activity, machinery vibrations, and environmental noise. It distinguishes between authorized and unauthorized movements, identifies patterns consistent with security threats, and filters out false positives from natural phenomena like wind or rain.",
    shortAnswer: "It detects human footsteps, vehicles, animals, and machinery while filtering environmental noise."
  },
  {
    topic: "real_time",
    keywords: ["real time", "realtime", "live", "instant", "immediate", "fast", "speed", "quick", "millisecond", "response time", "latency"],
    answer: "SynapSense provides millisecond-level detection and instant notifications for rapid response to potential security events. The system processes vibration data continuously and can classify threats within milliseconds of detection, enabling immediate alerts to security personnel.",
    shortAnswer: "Millisecond-level detection with instant real-time alerts for rapid security response."
  },
  {
    topic: "technology",
    keywords: ["technology", "tech", "technical", "sensor", "sensors", "fft", "fourier", "algorithm", "machine learning", "ml", "ai", "neural", "signal processing"],
    answer: "SynapSense uses multiple technologies: High-sensitivity geophone sensors for vibration detection, FFT (Fast Fourier Transform) for frequency analysis, advanced digital signal processing for noise filtering, and neural network models trained on millions of vibration signatures for accurate classification. The system continuously learns and adapts to environmental changes.",
    shortAnswer: "Uses geophone sensors, FFT analysis, signal processing, and neural networks for detection."
  },
  {
    topic: "use_cases",
    keywords: ["use case", "application", "who uses", "where", "industry", "sector", "military", "defense", "commercial", "residential", "infrastructure", "benefit", "suitable"],
    answer: "SynapSense is suitable for: Military & Defense (perimeter security for bases), Critical Infrastructure (power plants, water facilities, data centers), Commercial Properties (warehouses, manufacturing facilities, corporate campuses), and Residential Security (high-value properties and gated communities). It's trusted by security professionals worldwide.",
    shortAnswer: "Used in military, critical infrastructure, commercial properties, and high-value residential security."
  },
  {
    topic: "weather",
    keywords: ["weather", "outdoor", "rain", "snow", "temperature", "climate", "environment", "ip67", "waterproof", "resistant", "durable"],
    answer: "All SynapSense sensors are designed with IP67 or higher ratings, making them fully weather-resistant and suitable for outdoor deployment. They can operate in temperatures from -40°C to +85°C and are protected against dust, rain, snow, and extreme humidity. Temperature compensation algorithms maintain accuracy across varying conditions.",
    shortAnswer: "IP67 rated sensors work in all weather, from -40°C to +85°C, fully waterproof and dustproof."
  },
  {
    topic: "zones",
    keywords: ["zone", "zones", "area", "areas", "multiple", "multi", "simultaneous", "coverage", "monitor", "monitoring"],
    answer: "SynapSense supports multi-zone monitoring with independent sensor arrays for each zone. The system can handle up to 50 zones simultaneously with individual configuration settings, alert rules, and sensitivity levels for each area. A centralized dashboard provides a unified view of all zones.",
    shortAnswer: "Supports up to 50 independent zones with individual settings and centralized management."
  },
  {
    topic: "customization",
    keywords: ["custom", "customize", "setting", "settings", "configure", "configuration", "threshold", "sensitivity", "personalize", "adjust", "notification"],
    answer: "SynapSense offers comprehensive customization options. Users can set custom sensitivity levels for different zones, configure alert thresholds based on amplitude or frequency characteristics, schedule monitoring periods, and choose notification methods including in-app alerts, email notifications, and SMS messages.",
    shortAnswer: "Fully customizable sensitivity, thresholds, schedules, and notification preferences per zone."
  },
  {
    topic: "data_storage",
    keywords: ["data", "storage", "history", "historical", "store", "stored", "backup", "cloud", "retention", "export", "report"],
    answer: "The system stores all vibration data with full waveform retention for 30 days and summary statistics for up to 12 months. Users can access historical graphs, replay past events, generate reports, and export data for external analysis. Secure cloud backup ensures data integrity and availability.",
    shortAnswer: "30 days full waveform storage, 12 months statistics, with cloud backup and export options."
  },
  {
    topic: "maintenance",
    keywords: ["maintenance", "maintain", "calibrate", "calibration", "update", "service", "battery", "upkeep", "care"],
    answer: "SynapSense requires minimal maintenance. Sensors should be calibrated every 6 months for accuracy. The system performs automated daily health checks and alerts if issues are detected. Software updates are automatic, and wireless sensor batteries typically last 2-3 years.",
    shortAnswer: "Minimal maintenance: 6-month calibration cycle, auto health checks, 2-3 year battery life."
  },
  {
    topic: "false_alarms",
    keywords: ["false alarm", "false positive", "reduce", "minimize", "filter", "noise", "unwanted", "mistake", "error"],
    answer: "SynapSense employs multiple layers of false alarm reduction including adaptive threshold adjustment, pattern verification, temporal correlation analysis, and machine learning classification. Environmental conditions are continuously monitored and factored into detection algorithms. Users can also define exclusion zones and time-based filtering.",
    shortAnswer: "Multi-layer false alarm reduction using adaptive thresholds, ML classification, and pattern analysis."
  },
  {
    topic: "purpose_mission",
    keywords: ["purpose", "mission", "goal", "objective", "why", "vision", "aim"],
    answer: "At SynapSense, our mission is to provide the most advanced, reliable, and intelligent vibration detection technology to protect what matters most. We believe security should be proactive, not reactive. By detecting threats before they materialize and providing actionable intelligence in real-time, we empower clients to maintain safe, secure environments.",
    shortAnswer: "To provide proactive, intelligent security that detects threats before they materialize."
  },
  {
    topic: "contact_support",
    keywords: ["contact", "support", "help", "assistance", "reach", "phone", "email", "team", "customer service"],
    answer: "Our support team is available 24/7 to help you with any questions or concerns about SynapSense. You can reach us through the Contact page in the app, email us at support@synapsense.com, or call our helpline. We're committed to ensuring you get the most out of our vibration detection system.",
    shortAnswer: "24/7 support available via the Contact page, email, or helpline."
  },
  {
    topic: "dashboard",
    keywords: ["dashboard", "interface", "ui", "display", "screen", "view", "home", "main"],
    answer: "The SynapSense Dashboard provides a real-time overview of your security system. It shows live detection status, today's events summary, threat classification (safe vs danger), detection accuracy, busiest hours, alarm counts, and detailed analytics graphs. You can quickly navigate to notifications, vibrations, and other sections.",
    shortAnswer: "Real-time dashboard showing live status, events, analytics, and quick navigation."
  },
  {
    topic: "vibrations_page",
    keywords: ["vibration page", "live vibration", "signal", "wave", "waveform", "graph", "visualization", "live signal"],
    answer: "The Vibrations page shows real-time signal visualization with live waveform displays. You can see the actual vibration patterns being detected by sensors, analyze frequency components, and monitor signal strength. It connects to sensors via WebSocket for live data streaming.",
    shortAnswer: "Real-time waveform visualization of live sensor signals with frequency analysis."
  },
  {
    topic: "notifications",
    keywords: ["notification", "notifications", "alert", "alerts", "warning", "event", "events", "history", "log"],
    answer: "The Notifications page displays all security events and alerts. You can view event history, see threat classifications, check timestamps, and review details of each detection. Events are categorized by type (known/unknown, safe/danger) with filtering options.",
    shortAnswer: "View all security alerts and events with classification, history, and filtering options."
  },
  {
    topic: "profile_settings",
    keywords: ["profile", "account", "user", "personal", "my info", "my account"],
    answer: "The Profile page lets you manage your account information, view your activity history, and customize your personal preferences. You can update your details and see your interaction history with the system.",
    shortAnswer: "Manage your account, view activity history, and customize personal preferences."
  },
  {
    topic: "esp32_hardware",
    keywords: ["esp32", "hardware", "device", "microcontroller", "iot", "sensor device", "equipment", "physical"],
    answer: "SynapSense uses ESP32 microcontrollers connected to seismic sensors. The hardware communicates via WebSocket protocol at 192.168.4.1:81. The system processes sensor data locally and sends classified events to the web dashboard in real-time.",
    shortAnswer: "ESP32 microcontrollers with seismic sensors, communicating via WebSocket."
  },
  {
    topic: "greeting",
    keywords: ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening", "howdy"],
    answer: "Hello! I'm the SynapSense Voice Assistant. I can help you navigate the app and answer questions about our vibration-based security system. Try asking me things like 'What is SynapSense?' or 'How accurate is the detection?' or simply say 'Open dashboard'.",
    shortAnswer: "Hello! I'm here to help you with SynapSense. Ask me anything!"
  },
  {
    topic: "capabilities",
    keywords: ["what can you do", "your features", "capabilities", "abilities", "commands", "help me", "assist"],
    answer: "I can help you with: 1) Navigating the app - say 'Open dashboard', 'Show vibrations', 'Go to settings', etc. 2) Answering questions about SynapSense - ask about accuracy, technology, features, or any topic. 3) Explaining how the system works. Just ask naturally, I understand context!",
    shortAnswer: "I navigate the app and answer questions about SynapSense. Ask anything!"
  }
];

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 STATE MANAGEMENT (Dev Mode)
  // ═══════════════════════════════════════════════════════════════════════════
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [lastIntent, setLastIntent] = useState("");
  const [commandHistory, setCommandHistory] = useState([]);
  const [showDevPanel, setShowDevPanel] = useState(DEV_MODE && DEV_CONFIG.showDebugPanel);
  const [mockInput, setMockInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle, listening, processing, speaking, error
  const [errorLog, setErrorLog] = useState([]);

  // 💬 Answer Display State
  const [showAnswerPanel, setShowAnswerPanel] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // 📝 DEV LOGGER
  // ═══════════════════════════════════════════════════════════════════════════
  const devLog = (type, message, data = null) => {
    if (!DEV_MODE || !DEV_CONFIG.logToConsole) return;

    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
      speech: "🎙️",
      intent: "🧠",
    }[type] || "📌";

    console.log(`[${timestamp}] ${prefix} [VoiceAssistant] ${message}`, data || "");

    if (type === "error") {
      setErrorLog(prev => [...prev.slice(-4), { timestamp, message, data }]);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔊 SPEAK (with Dev Mode support)
  // ═══════════════════════════════════════════════════════════════════════════
  const speak = (text) => {
    devLog("speech", `Speaking: "${text}"`);
    setStatus("speaking");

    if (DEV_MODE && DEV_CONFIG.mockSpeechSynthesis) {
      devLog("info", "Mock TTS - No audio output");
      setTimeout(() => setStatus("idle"), 1000);
      return;
    }

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";

    utterance.onend = () => {
      devLog("info", "Speech synthesis completed");
      setStatus("idle");
    };

    utterance.onerror = (e) => {
      devLog("error", "Speech synthesis error", e);
      setStatus("error");
    };

    speechSynthesis.speak(utterance);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔇 STOP SPEAKING
  // ═══════════════════════════════════════════════════════════════════════════
  const stopSpeaking = () => {
    if (speechSynthesis.speaking) {
      devLog("info", "Stopping speech synthesis");
      speechSynthesis.cancel();
      setStatus("idle");
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧠 NAVIGATION INTENT RESOLVER
  // ═══════════════════════════════════════════════════════════════════════════
  const INTENT_MAP = [
    { pattern: /(go to |open |show |navigate to )?(home|dashboard|main)/i, route: "/", response: "Opening home page" },
    { pattern: /(go to |open |show |navigate to )?(vibration|signal|wave|live signal)/i, route: "/vibrations", response: "Showing live vibrations" },
    { pattern: /(go to |open |show |navigate to )?(notification|alert|intruder|events)/i, route: "/notifications", response: "Opening notifications" },
    { pattern: /(go to |open |show |navigate to )?(profile|account|my profile|my account)/i, route: "/profile", response: "Opening your profile" },
    { pattern: /(go to |open |show |navigate to )?(setting|settings|preference|configure)/i, route: "/settings", response: "Opening settings" },
    { pattern: /(go to |open |show |navigate to )?(faq|faqs|help section)/i, route: "/faqs", response: "Opening help section" },
    { pattern: /(go to |open |show |navigate to )?(about|about page|information)/i, route: "/about", response: "Opening about page" },
    { pattern: /(go to |open |show |navigate to )?(contact|contacts)/i, route: "/contacts", response: "Opening contacts" },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔍 INTELLIGENT Q&A RESOLVER (Dynamic Keyword Matching)
  // ═══════════════════════════════════════════════════════════════════════════
  const findBestAnswer = (query) => {
    const text = query.toLowerCase().trim();
    devLog("intent", `Searching knowledge base for: "${text}"`);

    let bestMatch = null;
    let highestScore = 0;

    for (const entry of KNOWLEDGE_BASE) {
      let score = 0;
      const words = text.split(/\s+/);

      // Check each keyword for matches
      for (const keyword of entry.keywords) {
        // Exact phrase match (highest priority)
        if (text.includes(keyword.toLowerCase())) {
          score += keyword.split(' ').length * 3; // Multi-word phrases get higher scores
        }

        // Individual word matches
        for (const word of words) {
          if (keyword.toLowerCase().includes(word) && word.length > 2) {
            score += 1;
          }
        }
      }

      // Boost score for topic-related words in query
      const topicWords = entry.topic.split('_');
      for (const topicWord of topicWords) {
        if (text.includes(topicWord)) {
          score += 2;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = entry;
      }
    }

    devLog("info", `Best match score: ${highestScore}`, bestMatch?.topic);

    // Require minimum score threshold for a valid match
    if (highestScore >= 2 && bestMatch) {
      return bestMatch;
    }

    return null;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 UNIFIED INTENT & Q&A RESOLVER
  // ═══════════════════════════════════════════════════════════════════════════
  const resolveIntent = (sentence) => {
    const text = sentence.toLowerCase().trim();
    devLog("intent", `Resolving intent for: "${text}"`);
    setStatus("processing");

    // Check for navigation commands first
    for (const intent of INTENT_MAP) {
      if (intent.pattern.test(text)) {
        devLog("success", `Navigation matched: ${intent.route}`);
        setLastIntent(`🔗 ${intent.route} → ${intent.response}`);
        setCurrentAnswer(null);
        setShowAnswerPanel(false);
        navigate(intent.route);
        return { type: "navigation", response: intent.response };
      }
    }

    // Check for Q&A (questions about the app)
    const knowledgeMatch = findBestAnswer(text);
    if (knowledgeMatch) {
      devLog("success", `Q&A matched: ${knowledgeMatch.topic}`);
      setLastIntent(`💬 Q&A: ${knowledgeMatch.topic}`);

      // Set answer for display
      setCurrentAnswer({
        question: sentence,
        topic: knowledgeMatch.topic,
        shortAnswer: knowledgeMatch.shortAnswer,
        fullAnswer: knowledgeMatch.answer,
        timestamp: new Date().toLocaleTimeString(),
      });
      setShowAnswerPanel(true);

      return { type: "qa", response: knowledgeMatch.shortAnswer, fullAnswer: knowledgeMatch.answer };
    }

    devLog("warning", "No intent or Q&A matched", { input: text });
    setLastIntent("❓ Unable to answer");
    setCurrentAnswer({
      question: sentence,
      topic: "unknown",
      shortAnswer: "Sorry, I'm unable to answer that question. Please try asking about SynapSense features or use a navigation command.",
      fullAnswer: "I apologize, but I couldn't find an answer to your question. Here are some things I can help you with:\n\n• What is SynapSense?\n• How does SynapSense work?\n• What is the detection accuracy?\n• What threats can it detect?\n• How do I customize settings?\n• What technology does it use?\n\nYou can also navigate by saying 'Open dashboard', 'Show notifications', or 'Go to settings'.",
      timestamp: new Date().toLocaleTimeString(),
    });
    setShowAnswerPanel(true);

    return { type: "unknown", response: "Sorry, I'm unable to answer that question. Please try asking about SynapSense or use a navigation command." };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 📜 COMMAND HISTORY
  // ═══════════════════════════════════════════════════════════════════════════
  const addToHistory = (command, response, type = "command") => {
    const entry = {
      id: Date.now(),
      command,
      response,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };

    setCommandHistory(prev => [entry, ...prev].slice(0, DEV_CONFIG.maxHistoryItems));
    devLog("info", "Added to history", entry);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎙️ PROCESS VOICE INPUT
  // ═══════════════════════════════════════════════════════════════════════════
  const processVoiceInput = (spokenText) => {
    devLog("speech", `Processing input: "${spokenText}"`);
    setCurrentTranscript(spokenText);

    const result = resolveIntent(spokenText);
    addToHistory(spokenText, result.response, result.type);

    // Speak the response (short answer for Q&A, full response for navigation)
    speak(result.response);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎙️ START LISTENING
  // ═══════════════════════════════════════════════════════════════════════════
  const startListening = () => {
    devLog("info", "Starting voice recognition...");

    // Mock mode - skip actual speech recognition
    if (DEV_MODE && DEV_CONFIG.mockSpeechRecognition) {
      devLog("info", "Mock mode - Use text input in dev panel");
      setShowDevPanel(true);
      return;
    }

    if (!SpeechRecognition) {
      devLog("error", "Speech recognition not supported");
      alert("Speech recognition not supported in this browser. Enable mock mode in dev settings.");
      return;
    }

    // Cleanup old instance
    if (recognitionRef.current) {
      devLog("info", "Aborting previous recognition instance");
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = DEV_MODE; // Show interim results in dev mode

    recognition.onstart = () => {
      devLog("success", "Recognition started");
      setIsListening(true);
      setStatus("listening");
      setCurrentTranscript("");
      speak("Listening");
    };

    recognition.onresult = (event) => {
      const result = event.results[0];
      const spokenText = result[0].transcript;
      const confidence = (result[0].confidence * 100).toFixed(1);

      devLog("speech", `Recognized: "${spokenText}" (confidence: ${confidence}%)`);

      if (result.isFinal) {
        processVoiceInput(spokenText);
      } else {
        setCurrentTranscript(`${spokenText} (interim)`);
      }
    };

    recognition.onerror = (event) => {
      devLog("error", `Recognition error: ${event.error}`, event);
      setStatus("error");
      setIsListening(false);

      const errorMessages = {
        "no-speech": "No speech detected. Please try again.",
        "audio-capture": "Microphone not accessible.",
        "not-allowed": "Microphone permission denied.",
        "network": "Network error occurred.",
        "aborted": "Recognition was aborted.",
      };

      speak(errorMessages[event.error] || "Please try again");
    };

    recognition.onend = () => {
      devLog("info", "Recognition ended");
      setIsListening(false);
      if (status === "listening") setStatus("idle");
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧪 MOCK INPUT HANDLER (Dev Mode)
  // ═══════════════════════════════════════════════════════════════════════════
  const handleMockSubmit = (e) => {
    e.preventDefault();
    if (!mockInput.trim()) return;

    devLog("info", `Mock input submitted: "${mockInput}"`);
    processVoiceInput(mockInput);
    setMockInput("");
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎨 STATUS COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  const statusColors = {
    idle: "bg-slate-500",
    listening: "bg-emerald-500 animate-pulse",
    processing: "bg-amber-500",
    speaking: "bg-indigo-500",
    error: "bg-rose-500",
  };

  const statusLabels = {
    idle: "Ready",
    listening: "🎙️ Listening...",
    processing: "🧠 Processing...",
    speaking: "🔊 Speaking...",
    error: "❌ Error",
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧹 CLEANUP
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      speechSynthesis.cancel();
    };
  }, []);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════
          🎙️ MAIN VOICE BUTTON - Professional Design
      ═══════════════════════════════════════════════════════════════════════ */}
      <button
        onClick={startListening}
        disabled={isListening}
        className={`fixed bottom-6 right-6 z-[9999]
                   ${isListening
            ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
            : "bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 shadow-indigo-500/30"}
                   text-white w-14 h-14 rounded-2xl
                   shadow-xl transition-all duration-300 ease-out
                   ${isListening ? "scale-110 animate-pulse" : "scale-100 hover:scale-105"}
                   disabled:cursor-not-allowed
                   flex items-center justify-center
                   border border-white/20`}
        title={isListening ? "Listening..." : "Click to speak"}
      >
        <span className="text-2xl">{isListening ? "🎧" : "🎙️"}</span>
      </button>

      {/* ═══════════════════════════════════════════════════════════════════════
          🛠️ DEV PANEL TOGGLE
      ═══════════════════════════════════════════════════════════════════════ */}
      {DEV_MODE && (
        <button
          onClick={() => setShowDevPanel(!showDevPanel)}
          className={`fixed bottom-6 right-24 z-[9999]
                     ${showDevPanel
              ? "bg-slate-600 border-slate-400"
              : "bg-slate-700/90 hover:bg-slate-600 border-slate-500/50"}
                     text-slate-200 hover:text-white w-11 h-11 rounded-xl
                     shadow-lg transition-all duration-200
                     flex items-center justify-center
                     border backdrop-blur-sm`}
          title="Toggle Dev Panel"
        >
          <span className="text-lg">⚙️</span>
        </button>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          📊 DEVELOPMENT DEBUG PANEL
      ═══════════════════════════════════════════════════════════════════════ */}
      {DEV_MODE && showDevPanel && (
        <div className="fixed bottom-20 right-6 z-[9998] w-80 
                        bg-slate-900/95 backdrop-blur-md rounded-2xl 
                        shadow-2xl border border-slate-700/50 
                        text-white text-sm overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="font-semibold">SynapSense Assistant</span>
            </div>
            <button
              onClick={() => setShowDevPanel(false)}
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg w-7 h-7 flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">

            {/* Status */}
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2">
              <span className={`w-3 h-3 rounded-full ${statusColors[status]}`}></span>
              <span className="font-medium">{statusLabels[status]}</span>
            </div>

            {/* Current Transcript */}
            {DEV_CONFIG.showTranscript && currentTranscript && (
              <div className="bg-slate-800 rounded-xl p-3 border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">📝 Transcript</div>
                <div className="text-emerald-400">"{currentTranscript}"</div>
              </div>
            )}

            {/* Last Intent */}
            {lastIntent && (
              <div className="bg-slate-800 rounded-xl p-3 border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">🧠 Last Intent</div>
                <div className="text-indigo-400">{lastIntent}</div>
              </div>
            )}

            {/* Mock Input */}
            <form onSubmit={handleMockSubmit} className="flex gap-2">
              <input
                type="text"
                value={mockInput}
                onChange={(e) => setMockInput(e.target.value)}
                placeholder="Ask a question or type a command..."
                className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5
                           text-white placeholder-slate-500 text-sm
                           focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50
                           transition-all"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-xl transition-colors font-medium"
              >
                ➤
              </button>
            </form>

            {/* Quick Commands */}
            <div>
              <div className="text-xs text-slate-400 mb-2">⚡ Quick Commands</div>
              <div className="flex flex-wrap gap-1.5">
                {["home", "vibrations", "notifications", "profile", "settings", "faqs", "about"].map(cmd => (
                  <button
                    key={cmd}
                    onClick={() => processVoiceInput(cmd)}
                    className="bg-slate-700/70 hover:bg-slate-600 px-2.5 py-1 rounded-lg text-xs transition-colors capitalize"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>

            {/* Command History */}
            {DEV_CONFIG.showCommandHistory && commandHistory.length > 0 && (
              <div>
                <div className="text-xs text-slate-400 mb-2">📜 History</div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {commandHistory.map(entry => (
                    <div key={entry.id} className="bg-slate-800 rounded-xl p-2.5 text-xs border border-slate-700/50">
                      <div className="flex justify-between text-slate-500">
                        <span>{entry.timestamp}</span>
                      </div>
                      <div className="text-emerald-400">"{entry.command}"</div>
                      <div className="text-indigo-400">→ {entry.response}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Log */}
            {errorLog.length > 0 && (
              <div>
                <div className="text-xs text-rose-400 mb-2">❌ Errors</div>
                <div className="space-y-1">
                  {errorLog.map((err, i) => (
                    <div key={i} className="bg-rose-950/50 rounded-xl p-2.5 text-xs text-rose-300 border border-rose-800/30">
                      [{err.timestamp}] {err.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dev Config */}
            <details className="text-xs">
              <summary className="text-slate-400 cursor-pointer hover:text-slate-300 py-1">
                ⚙️ Configuration
              </summary>
              <pre className="mt-2 bg-slate-800 rounded-xl p-3 overflow-x-auto text-slate-300 border border-slate-700/50">
                {JSON.stringify(DEV_CONFIG, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          💬 FLOATING ANSWER PANEL (Shows Q&A Responses)
      ═══════════════════════════════════════════════════════════════════════ */}
      {showAnswerPanel && currentAnswer && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[9997] 
                        w-[90%] max-w-lg
                        bg-gradient-to-br from-slate-900/98 to-indigo-950/98 
                        backdrop-blur-xl rounded-2xl 
                        shadow-2xl border border-indigo-500/20 
                        text-white overflow-hidden
                        animate-[slideUp_0.3s_ease-out]">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <span className="font-bold text-lg">SynapSense Assistant</span>
                <div className="text-xs text-white/70">AI-Powered Help</div>
              </div>
            </div>
            <button
              onClick={() => {
                stopSpeaking();
                setShowAnswerPanel(false);
                setCurrentAnswer(null);
              }}
              className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 
                         rounded-xl w-8 h-8 flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-4">

            {/* Question Asked */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
              <div className="text-xs text-indigo-300 mb-1 flex items-center gap-1">
                <span>🎙️</span> You asked:
              </div>
              <div className="text-white font-medium text-lg">"{currentAnswer.question}"</div>
            </div>

            {/* Short Answer (always visible) */}
            <div className="bg-gradient-to-r from-indigo-500/15 to-purple-500/15 
                            border border-indigo-500/20 rounded-xl p-4">
              <div className="text-xs text-emerald-400 mb-2 flex items-center gap-1 font-medium">
                <span>✨</span> Answer:
              </div>
              <div className="text-white text-base leading-relaxed">
                {currentAnswer.shortAnswer}
              </div>
            </div>

            {/* Full Answer (expandable) */}
            {currentAnswer.fullAnswer && currentAnswer.topic !== "unknown" && (
              <details className="group">
                <summary className="cursor-pointer text-indigo-300 hover:text-indigo-200 
                                    flex items-center gap-2 text-sm font-medium
                                    py-2.5 px-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition border border-slate-700/30">
                  <span className="group-open:rotate-90 transition-transform">▶</span>
                  📖 Read full explanation
                </summary>
                <div className="mt-3 bg-slate-800/50 rounded-xl p-4 text-slate-200 leading-relaxed text-sm border border-slate-700/30">
                  {currentAnswer.fullAnswer}
                </div>
              </details>
            )}

            {/* Suggestion chips for unknown queries */}
            {currentAnswer.topic === "unknown" && (
              <div className="space-y-3 bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                <div className="text-xs text-amber-300 font-medium">💡 Suggested questions:</div>
                <div className="flex flex-wrap gap-2">
                  {["What is SynapSense?", "How accurate?", "What threats?", "Technology used"].map(q => (
                    <button
                      key={q}
                      onClick={() => processVoiceInput(q)}
                      className="bg-slate-700/70 hover:bg-slate-600 px-3 py-1.5 
                                 rounded-lg text-xs transition border border-slate-600/50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamp & Topic */}
            <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-700/30">
              <span className="capitalize">🏷️ {currentAnswer.topic.replace(/_/g, ' ')}</span>
              <span>🕐 {currentAnswer.timestamp}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-5 pb-5 flex gap-3">
            <button
              onClick={() => speak(currentAnswer.fullAnswer || currentAnswer.shortAnswer)}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 
                         text-white py-2.5 px-4 rounded-xl font-medium transition-all 
                         flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              🔊 Read Aloud
            </button>
            <button
              onClick={() => {
                stopSpeaking();
                setShowAnswerPanel(false);
                setCurrentAnswer(null);
              }}
              className="flex-1 bg-slate-700/70 hover:bg-slate-600 text-white py-2.5 px-4 
                         rounded-xl font-medium transition border border-slate-600/50"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </>
  );
}
