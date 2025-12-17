import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════════════════════
// 📚 SYNAPSENSE KNOWLEDGE BASE (Professional Q&A System)
// ═══════════════════════════════════════════════════════════════════════════════
const KNOWLEDGE_BASE = [
  {
    topic: "what_is_synapsense",
    keywords: ["what", "synapsense", "what is", "explain", "tell me about", "describe", "introduction", "overview"],
    question: "What is SynapSense?",
    answer: "SynapSense is a cutting-edge vibration-based detection and monitoring system that uses advanced seismic sensor technology to provide comprehensive security and surveillance capabilities. It analyzes ground vibrations with military-grade precision to detect, classify, and alert you to various types of movement and activity in real-time.",
    shortAnswer: "SynapSense is an advanced vibration-based security system using seismic sensors for real-time threat detection.",
    category: "overview"
  },
  {
    topic: "how_it_works",
    keywords: ["how", "work", "works", "working", "function", "functions", "operate", "operation", "process", "mechanism"],
    question: "How does SynapSense work?",
    answer: "SynapSense works by using high-sensitivity geophone sensors that detect micro-vibrations in the ground. The system processes thousands of data points per second using Fast Fourier Transform (FFT) analysis and machine learning algorithms. It distinguishes between harmless environmental noise and genuine security concerns, providing real-time alerts within milliseconds.",
    shortAnswer: "It uses seismic sensors and FFT analysis with machine learning to detect and classify vibrations in real-time.",
    category: "technology"
  },
  {
    topic: "benefits",
    keywords: ["benefit", "benefits", "advantage", "advantages", "why use", "useful", "help", "value", "worth", "important"],
    question: "What are the benefits of using SynapSense?",
    answer: "SynapSense offers several key benefits: 1) 24/7 automated surveillance without human fatigue, 2) Detection of threats before visual contact is possible, 3) Works in complete darkness and adverse weather conditions, 4) Invisible to intruders - cannot be seen or disabled, 5) Low false alarm rates thanks to AI-powered classification, 6) Seamless integration with existing security systems, 7) Remote monitoring capability from anywhere in the world.",
    shortAnswer: "24/7 invisible surveillance that works in any condition with minimal false alarms.",
    category: "overview"
  },
  {
    topic: "accuracy",
    keywords: ["accuracy", "accurate", "precision", "reliable", "reliability", "false alarm", "false positive", "detection rate", "percentage", "how accurate"],
    question: "How accurate is SynapSense?",
    answer: "SynapSense maintains a detection accuracy of 98.7% under normal operating conditions. The system uses multiple validation techniques including pattern recognition, frequency analysis, and amplitude threshold detection. Continuous machine learning improvements and regular calibration ensure consistent high accuracy with minimal false alarms.",
    shortAnswer: "SynapSense has 98.7% detection accuracy with minimal false alarms using ML-based validation.",
    category: "technology"
  },
  {
    topic: "threats_detection",
    keywords: ["threat", "threats", "detect", "detection", "intruder", "intrusion", "security", "danger", "dangerous", "alert", "what can", "types", "classify"],
    question: "What types of threats can SynapSense detect?",
    answer: "SynapSense can detect and classify multiple types of vibration sources including human footsteps, animal movements, vehicle activity, machinery vibrations, and environmental noise. It distinguishes between authorized and unauthorized movements, identifies patterns consistent with security threats, and filters out false positives from natural phenomena like wind or rain.",
    shortAnswer: "It detects human footsteps, vehicles, animals, and machinery while filtering environmental noise.",
    category: "features"
  },
  {
    topic: "real_time",
    keywords: ["real time", "realtime", "live", "instant", "immediate", "fast", "speed", "quick", "millisecond", "response time", "latency"],
    question: "How fast does SynapSense respond?",
    answer: "SynapSense provides millisecond-level detection and instant notifications for rapid response to potential security events. The system processes vibration data continuously and can classify threats within milliseconds of detection, enabling immediate alerts to security personnel.",
    shortAnswer: "Millisecond-level detection with instant real-time alerts for rapid security response.",
    category: "technology"
  },
  {
    topic: "technology",
    keywords: ["technology", "tech", "technical", "sensor", "sensors", "fft", "fourier", "algorithm", "machine learning", "ml", "ai", "neural", "signal processing"],
    question: "What technology powers SynapSense?",
    answer: "SynapSense uses multiple technologies: High-sensitivity geophone sensors for vibration detection, FFT (Fast Fourier Transform) for frequency analysis, advanced digital signal processing for noise filtering, and neural network models trained on millions of vibration signatures for accurate classification. The system continuously learns and adapts to environmental changes.",
    shortAnswer: "Uses geophone sensors, FFT analysis, signal processing, and neural networks for detection.",
    category: "technology"
  },
  {
    topic: "use_cases",
    keywords: ["use case", "application", "who uses", "where", "industry", "sector", "military", "defense", "commercial", "residential", "infrastructure", "suitable"],
    question: "Who uses SynapSense?",
    answer: "SynapSense is suitable for: Military & Defense (perimeter security for bases), Critical Infrastructure (power plants, water facilities, data centers), Commercial Properties (warehouses, manufacturing facilities, corporate campuses), and Residential Security (high-value properties and gated communities). It's trusted by security professionals worldwide.",
    shortAnswer: "Used in military, critical infrastructure, commercial properties, and high-value residential security.",
    category: "overview"
  },
  {
    topic: "weather",
    keywords: ["weather", "outdoor", "rain", "snow", "temperature", "climate", "environment", "ip67", "waterproof", "resistant", "durable"],
    question: "Does SynapSense work in all weather conditions?",
    answer: "All SynapSense sensors are designed with IP67 or higher ratings, making them fully weather-resistant and suitable for outdoor deployment. They can operate in temperatures from -40°C to +85°C and are protected against dust, rain, snow, and extreme humidity. Temperature compensation algorithms maintain accuracy across varying conditions.",
    shortAnswer: "IP67 rated sensors work in all weather, from -40°C to +85°C, fully waterproof and dustproof.",
    category: "features"
  },
  {
    topic: "zones",
    keywords: ["zone", "zones", "area", "areas", "multiple", "multi", "simultaneous", "coverage", "monitor", "monitoring"],
    question: "How many zones can SynapSense monitor?",
    answer: "SynapSense supports multi-zone monitoring with independent sensor arrays for each zone. The system can handle up to 50 zones simultaneously with individual configuration settings, alert rules, and sensitivity levels for each area. A centralized dashboard provides a unified view of all zones.",
    shortAnswer: "Supports up to 50 independent zones with individual settings and centralized management.",
    category: "features"
  },
  {
    topic: "customization",
    keywords: ["custom", "customize", "setting", "settings", "configure", "configuration", "threshold", "sensitivity", "personalize", "adjust", "notification"],
    question: "Can I customize SynapSense settings?",
    answer: "SynapSense offers comprehensive customization options. Users can set custom sensitivity levels for different zones, configure alert thresholds based on amplitude or frequency characteristics, schedule monitoring periods, and choose notification methods including in-app alerts, email notifications, and SMS messages.",
    shortAnswer: "Fully customizable sensitivity, thresholds, schedules, and notification preferences per zone.",
    category: "features"
  },
  {
    topic: "data_storage",
    keywords: ["data", "storage", "history", "historical", "store", "stored", "backup", "cloud", "retention", "export", "report"],
    question: "How is data stored in SynapSense?",
    answer: "The system stores all vibration data with full waveform retention for 30 days and summary statistics for up to 12 months. Users can access historical graphs, replay past events, generate reports, and export data for external analysis. Secure cloud backup ensures data integrity and availability.",
    shortAnswer: "30 days full waveform storage, 12 months statistics, with cloud backup and export options.",
    category: "features"
  },
  {
    topic: "maintenance",
    keywords: ["maintenance", "maintain", "calibrate", "calibration", "update", "service", "battery", "upkeep", "care"],
    question: "What maintenance does SynapSense require?",
    answer: "SynapSense requires minimal maintenance. Sensors should be calibrated every 6 months for accuracy. The system performs automated daily health checks and alerts if issues are detected. Software updates are automatic, and wireless sensor batteries typically last 2-3 years.",
    shortAnswer: "Minimal maintenance: 6-month calibration cycle, auto health checks, 2-3 year battery life.",
    category: "features"
  },
  {
    topic: "false_alarms",
    keywords: ["false alarm", "false positive", "reduce", "minimize", "filter", "noise", "unwanted", "mistake", "error"],
    question: "How does SynapSense reduce false alarms?",
    answer: "SynapSense employs multiple layers of false alarm reduction including adaptive threshold adjustment, pattern verification, temporal correlation analysis, and machine learning classification. Environmental conditions are continuously monitored and factored into detection algorithms. Users can also define exclusion zones and time-based filtering.",
    shortAnswer: "Multi-layer false alarm reduction using adaptive thresholds, ML classification, and pattern analysis.",
    category: "technology"
  },
  {
    topic: "purpose_mission",
    keywords: ["purpose", "mission", "goal", "objective", "why", "vision", "aim"],
    question: "What is SynapSense's mission?",
    answer: "At SynapSense, our mission is to provide the most advanced, reliable, and intelligent vibration detection technology to protect what matters most. We believe security should be proactive, not reactive. By detecting threats before they materialize and providing actionable intelligence in real-time, we empower clients to maintain safe, secure environments.",
    shortAnswer: "To provide proactive, intelligent security that detects threats before they materialize.",
    category: "overview"
  },
  {
    topic: "contact_support",
    keywords: ["contact", "support", "help", "assistance", "reach", "phone", "email", "team", "customer service"],
    question: "How can I get support?",
    answer: "Our support team is available 24/7 to help you with any questions or concerns about SynapSense. You can reach us through the Contact page in the app, email us at support@synapsense.com, or call our helpline. We're committed to ensuring you get the most out of our vibration detection system.",
    shortAnswer: "24/7 support available via the Contact page, email, or helpline.",
    category: "support"
  },
  {
    topic: "dashboard",
    keywords: ["dashboard", "interface", "ui", "display", "screen", "view", "home", "main"],
    question: "What can I see on the Dashboard?",
    answer: "The SynapSense Dashboard provides a real-time overview of your security system. It shows live detection status, today's events summary, threat classification (safe vs danger), detection accuracy, busiest hours, alarm counts, and detailed analytics graphs. You can quickly navigate to notifications, vibrations, and other sections.",
    shortAnswer: "Real-time dashboard showing live status, events, analytics, and quick navigation.",
    category: "navigation"
  },
  {
    topic: "vibrations_page",
    keywords: ["vibration page", "live vibration", "signal", "wave", "waveform", "graph", "visualization", "live signal"],
    question: "What is the Vibrations page?",
    answer: "The Vibrations page shows real-time signal visualization with live waveform displays. You can see the actual vibration patterns being detected by sensors, analyze frequency components, and monitor signal strength. It connects to sensors via WebSocket for live data streaming.",
    shortAnswer: "Real-time waveform visualization of live sensor signals with frequency analysis.",
    category: "navigation"
  },
  {
    topic: "notifications",
    keywords: ["notification", "notifications", "alert", "alerts", "warning", "event", "events", "history", "log"],
    question: "How do notifications work?",
    answer: "The Notifications page displays all security events and alerts. You can view event history, see threat classifications, check timestamps, and review details of each detection. Events are categorized by type (known/unknown, safe/danger) with filtering options.",
    shortAnswer: "View all security alerts and events with classification, history, and filtering options.",
    category: "navigation"
  },
  {
    topic: "profile_settings",
    keywords: ["profile", "account", "user", "personal", "my info", "my account"],
    question: "Where can I manage my profile?",
    answer: "The Profile page lets you manage your account information, view your activity history, and customize your personal preferences. You can update your details and see your interaction history with the system.",
    shortAnswer: "Manage your account, view activity history, and customize personal preferences.",
    category: "navigation"
  },
  {
    topic: "esp32_hardware",
    keywords: ["esp32", "hardware", "device", "microcontroller", "iot", "sensor device", "equipment", "physical"],
    question: "What hardware does SynapSense use?",
    answer: "SynapSense uses ESP32 microcontrollers connected to seismic sensors. The hardware communicates via WebSocket protocol at 192.168.4.1:81. The system processes sensor data locally and sends classified events to the web dashboard in real-time.",
    shortAnswer: "ESP32 microcontrollers with seismic sensors, communicating via WebSocket.",
    category: "technology"
  },
  {
    topic: "greeting",
    keywords: ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening", "howdy"],
    question: "Hello!",
    answer: "Hello! I'm the SynapSense Voice Assistant. I can help you navigate the app and answer questions about our vibration-based security system. Try asking me things like 'What is SynapSense?' or 'How accurate is the detection?' or simply say 'Open dashboard'.",
    shortAnswer: "Hello! I'm here to help you with SynapSense. Ask me anything!",
    category: "greeting"
  },
  {
    topic: "capabilities",
    keywords: ["what can you do", "your features", "capabilities", "abilities", "commands", "help me", "assist"],
    question: "What can you help me with?",
    answer: "I can help you with: 1) Navigating the app - say 'Open dashboard', 'Show vibrations', 'Go to settings', etc. 2) Answering questions about SynapSense - ask about accuracy, technology, features, or any topic. 3) Explaining how the system works. Just ask naturally, I understand context!",
    shortAnswer: "I navigate the app and answer questions about SynapSense. Ask anything!",
    category: "support"
  },
  {
    topic: "security_privacy",
    keywords: ["security", "privacy", "safe", "secure", "encrypt", "encryption", "data protection", "private"],
    question: "Is my data secure with SynapSense?",
    answer: "SynapSense takes data security seriously. All data is encrypted in transit and at rest using industry-standard AES-256 encryption. User authentication is protected by multi-factor authentication, and access controls ensure only authorized personnel can view sensitive data. We comply with major security standards and regulations.",
    shortAnswer: "AES-256 encryption, multi-factor authentication, and strict access controls protect your data.",
    category: "features"
  },
  {
    topic: "integration",
    keywords: ["integrate", "integration", "connect", "api", "third party", "external", "compatible", "compatibility"],
    question: "Can SynapSense integrate with other systems?",
    answer: "SynapSense offers extensive integration capabilities through RESTful APIs and WebSocket connections. You can integrate with existing CCTV systems, access control systems, alarm panels, and SIEM platforms. Custom integrations are also possible through our developer documentation.",
    shortAnswer: "RESTful APIs and WebSocket enable integration with CCTV, access control, and alarm systems.",
    category: "features"
  },
  {
    topic: "cost_pricing",
    keywords: ["cost", "price", "pricing", "expensive", "affordable", "subscription", "license", "pay"],
    question: "What does SynapSense cost?",
    answer: "SynapSense offers flexible pricing plans to suit different needs. Contact our sales team for a customized quote based on your specific requirements, including the number of zones, sensor count, and desired features. We offer both subscription and perpetual licensing options.",
    shortAnswer: "Flexible pricing available. Contact sales for a customized quote based on your needs.",
    category: "support"
  }
];

// Suggested questions grouped by category
const SUGGESTED_QUESTIONS = [
  { text: "What is SynapSense?", category: "overview" },
  { text: "How does it work?", category: "technology" },
  { text: "What are the benefits?", category: "overview" },
  { text: "How accurate is it?", category: "technology" },
  { text: "What can it detect?", category: "features" },
  { text: "Who uses SynapSense?", category: "overview" },
];

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const answerPanelRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  const [isListening, setIsListening] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle, listening, processing, speaking, error
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // 🛑 STOP SPEAKING
  // ═══════════════════════════════════════════════════════════════════════════
  const stopSpeaking = useCallback(() => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setStatus("idle");
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔊 SPEAK
  // ═══════════════════════════════════════════════════════════════════════════
  const speak = useCallback((text) => {
    speechSynthesis.cancel();
    setStatus("speaking");
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setStatus("idle");
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setStatus("idle");
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧠 INTENT MAP FOR NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════
  const INTENT_MAP = [
    { pattern: /(home|dashboard|main)/, route: "/", response: "Opening home page" },
    { pattern: /(vibration|signal|wave)/, route: "/vibrations", response: "Showing live vibrations" },
    { pattern: /(notification|alert|intruder)/, route: "/notifications", response: "Opening notifications" },
    { pattern: /(profile|account|my profile)/, route: "/profile", response: "Opening your profile" },
    { pattern: /(setting|settings|preference)/, route: "/settings", response: "Opening settings" },
    { pattern: /(faq|help|question)/, route: "/faqs", response: "Opening help section" },
    { pattern: /(about|information)/, route: "/about", response: "Opening about page" },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔍 FIND BEST ANSWER FROM KNOWLEDGE BASE
  // ═══════════════════════════════════════════════════════════════════════════
  const findAnswer = (query) => {
    const text = query.toLowerCase().trim();
    let bestMatch = null;
    let maxScore = 0;

    for (const entry of KNOWLEDGE_BASE) {
      let score = 0;
      for (const keyword of entry.keywords) {
        if (text.includes(keyword)) {
          score += keyword.split(" ").length; // Multi-word keywords get higher scores
        }
      }
      if (score > maxScore) {
        maxScore = score;
        bestMatch = entry;
      }
    }

    return maxScore > 0 ? bestMatch : null;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 PROCESS INPUT (Voice or Text)
  // ═══════════════════════════════════════════════════════════════════════════
  const processInput = useCallback((input) => {
    const text = input.toLowerCase().trim();
    setStatus("processing");

    // Add user message to history
    setConversationHistory(prev => [...prev, { type: "user", text: input }]);

    // Check for navigation intents first
    for (const intent of INTENT_MAP) {
      if (intent.pattern.test(text)) {
        navigate(intent.route);
        const response = intent.response;
        setConversationHistory(prev => [...prev, { type: "assistant", text: response }]);
        speak(response);
        return;
      }
    }

    // Check knowledge base for answers
    const match = findAnswer(text);
    if (match) {
      const response = match.answer;
      setConversationHistory(prev => [...prev, { type: "assistant", text: response }]);
      speak(match.shortAnswer);
      return;
    }

    // Fallback response
    const fallback = "I'm not sure about that specific question. Try asking about what SynapSense is, how it works, its accuracy, or say 'open dashboard' to navigate the app.";
    setConversationHistory(prev => [...prev, { type: "assistant", text: fallback }]);
    speak(fallback);
  }, [navigate, speak]);

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎙️ START LISTENING
  // ═══════════════════════════════════════════════════════════════════════════
  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      const errorMsg = "Speech recognition not supported. Please use the text input.";
      setConversationHistory(prev => [...prev, { type: "assistant", text: errorMsg }]);
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("listening");
      setCurrentTranscript("");
    };

    recognition.onresult = (event) => {
      const result = event.results[0];
      const spokenText = result[0].transcript;

      if (result.isFinal) {
        setCurrentTranscript("");
        processInput(spokenText);
      } else {
        setCurrentTranscript(spokenText);
      }
    };

    recognition.onerror = (event) => {
      setStatus("error");
      setIsListening(false);

      const errorMessages = {
        "no-speech": "No speech detected. Please try again.",
        "audio-capture": "Microphone not accessible.",
        "not-allowed": "Microphone permission denied.",
        "network": "Network error occurred.",
        "aborted": "Recognition was aborted.",
      };

      const errorMsg = errorMessages[event.error] || "Please try again.";
      setConversationHistory(prev => [...prev, { type: "assistant", text: errorMsg }]);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (status === "listening") setStatus("idle");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [processInput, status]);

  // ═══════════════════════════════════════════════════════════════════════════
  // 📝 HANDLE TEXT SUBMIT
  // ═══════════════════════════════════════════════════════════════════════════
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    processInput(textInput);
    setTextInput("");
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 HANDLE SUGGESTED QUESTION CLICK
  // ═══════════════════════════════════════════════════════════════════════════
  const handleSuggestedQuestion = (question) => {
    processInput(question);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 📋 TOGGLE PANEL
  // ═══════════════════════════════════════════════════════════════════════════
  const togglePanel = () => {
    stopSpeaking();
    setIsPanelOpen(!isPanelOpen);
    if (!isPanelOpen && conversationHistory.length === 0) {
      // Welcome message when opening
      const welcome = "Hello! I'm your SynapSense assistant. Ask me anything about the system or navigate the app.";
      setConversationHistory([{ type: "assistant", text: welcome }]);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧹 SCROLL TO BOTTOM ON NEW MESSAGES
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (answerPanelRef.current) {
      answerPanelRef.current.scrollTop = answerPanelRef.current.scrollHeight;
    }
  }, [conversationHistory]);

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

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎨 STATUS INDICATORS
  // ═══════════════════════════════════════════════════════════════════════════
  const getStatusStyle = () => {
    switch (status) {
      case "listening":
        return "bg-green-500 animate-pulse shadow-green-500/50";
      case "processing":
        return "bg-yellow-500 shadow-yellow-500/50";
      case "speaking":
        return "bg-blue-500 shadow-blue-500/50";
      case "error":
        return "bg-red-500 shadow-red-500/50";
      default:
        return "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/50";
    }
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════
          🔘 MAIN FLOATING BUTTON
      ═══════════════════════════════════════════════════════════════════════ */}
      <button
        onClick={togglePanel}
        className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full 
                   flex items-center justify-center text-white text-2xl
                   shadow-lg transition-all duration-300 transform
                   ${isPanelOpen ? "rotate-45 bg-red-500 hover:bg-red-600" : getStatusStyle()}
                   hover:scale-110`}
        title={isPanelOpen ? "Close Assistant" : "Open Voice Assistant"}
      >
        {isPanelOpen ? "✕" : "🎙️"}
      </button>

      {/* ═══════════════════════════════════════════════════════════════════════
          📊 PROFESSIONAL ASSISTANT PANEL
      ═══════════════════════════════════════════════════════════════════════ */}
      {isPanelOpen && (
        <div className="fixed bottom-24 right-6 z-[9998] w-96 max-h-[600px]
                        bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
                        rounded-2xl shadow-2xl border border-slate-700/50
                        overflow-hidden flex flex-col
                        animate-slideUp backdrop-blur-xl">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 
                          px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                <span className="text-xl">🧠</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">SynapSense Assistant</h3>
                <p className="text-indigo-200 text-xs">Ask anything • Navigate anywhere</p>
              </div>
            </div>
            <button
              onClick={() => { stopSpeaking(); setIsPanelOpen(false); }}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status Bar */}
          <div className="px-5 py-2 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status === "listening" ? "bg-green-500 animate-pulse" :
                status === "speaking" ? "bg-blue-500 animate-pulse" :
                  status === "processing" ? "bg-yellow-500" :
                    "bg-slate-500"
              }`}></span>
            <span className="text-slate-400 text-xs font-medium">
              {status === "listening" ? "Listening..." :
                status === "speaking" ? "Speaking..." :
                  status === "processing" ? "Processing..." :
                    "Ready to help"}
            </span>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="ml-auto text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <span>■</span> Stop
              </button>
            )}
          </div>

          {/* Conversation Area */}
          <div
            ref={answerPanelRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px]"
          >
            {conversationHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.type === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-slate-700/80 text-slate-200 rounded-bl-sm"
                  }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Interim transcript */}
            {currentTranscript && (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-indigo-600/50 text-white/70 rounded-br-sm">
                  <p className="text-sm italic">{currentTranscript}...</p>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Questions */}
          {conversationHistory.length <= 1 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-slate-500 mb-2 font-medium">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(q.text)}
                    className="text-xs px-3 py-1.5 rounded-full 
                               bg-slate-700/50 text-indigo-300 
                               hover:bg-indigo-600/30 hover:text-indigo-200
                               border border-slate-600/50 hover:border-indigo-500/50
                               transition-all duration-200"
                  >
                    {q.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-slate-800/50 border-t border-slate-700/50">
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl 
                           px-4 py-3 text-white placeholder-slate-400 text-sm
                           focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30
                           transition-all"
              />
              <button
                type="button"
                onClick={startListening}
                disabled={isListening}
                className={`w-12 h-12 rounded-xl flex items-center justify-center
                           transition-all duration-300 text-lg
                           ${isListening
                    ? "bg-green-500 animate-pulse text-white"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
                title={isListening ? "Listening..." : "Click to speak"}
              >
                {isListening ? "🎧" : "🎙️"}
              </button>
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600
                           hover:from-indigo-500 hover:to-purple-500
                           text-white flex items-center justify-center
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-700/30">
            <p className="text-center text-slate-500 text-xs">
              Powered by <span className="text-indigo-400 font-medium">SynapSense AI</span>
            </p>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
