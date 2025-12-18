import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  checkAPIHealth,
  startChallenge,
  verifyChallenge,
  verifyChallengeWithText,
  recordAudio,
  enrollUser,
  createVoiceStream,
  VoiceAuthSession
} from "../utils/voiceAuthService";

// ═══════════════════════════════════════════════════════════════════════════════
// 📚 SYNAPSENSE KNOWLEDGE BASE
// ═══════════════════════════════════════════════════════════════════════════════
const KNOWLEDGE_BASE = [
  {
    topic: "what_is_synapsense",
    keywords: ["what", "synapsense", "what is", "explain", "tell me about", "describe"],
    question: "What is SynapSense?",
    answer: "SynapSense is a cutting-edge vibration-based detection and monitoring system that uses advanced seismic sensor technology to provide comprehensive security and surveillance capabilities.",
    shortAnswer: "SynapSense is an advanced vibration-based security system using seismic sensors.",
    category: "overview"
  },
  {
    topic: "how_it_works",
    keywords: ["how", "work", "works", "working", "function", "operate"],
    question: "How does SynapSense work?",
    answer: "SynapSense uses high-sensitivity geophone sensors that detect micro-vibrations. The system processes data using FFT analysis and machine learning algorithms to distinguish threats from noise.",
    shortAnswer: "Uses seismic sensors and ML to detect and classify vibrations in real-time.",
    category: "technology"
  },
  {
    topic: "benefits",
    keywords: ["benefit", "benefits", "advantage", "why use", "useful"],
    question: "What are the benefits?",
    answer: "Key benefits: 24/7 automated surveillance, works in darkness and bad weather, invisible to intruders, low false alarm rates with AI classification, and remote monitoring capability.",
    shortAnswer: "24/7 invisible surveillance in any condition with minimal false alarms.",
    category: "overview"
  },
  {
    topic: "accuracy",
    keywords: ["accuracy", "accurate", "precision", "reliable", "detection rate"],
    question: "How accurate is SynapSense?",
    answer: "SynapSense maintains 98.7% detection accuracy using pattern recognition, frequency analysis, and continuous ML improvements.",
    shortAnswer: "98.7% detection accuracy with ML-based validation.",
    category: "technology"
  },
  {
    topic: "voice_auth",
    keywords: ["voice", "authentication", "voice auth", "verify", "enroll", "biometric"],
    question: "About voice authentication",
    answer: "Voice authentication uses AI to verify your identity. First enroll your voice by saying 3 sample phrases, then verify by speaking a challenge phrase. This prevents replay attacks.",
    shortAnswer: "AI voice auth with enrollment and challenge-response verification.",
    category: "security"
  },
  {
    topic: "greeting",
    keywords: ["hello", "hi", "hey", "greetings", "good morning"],
    question: "Hello!",
    answer: "Hello! I'm SynapSense Voice Assistant with biometric authentication. Say 'enroll my voice' to register, or 'verify my voice' to authenticate. After verification, you can navigate the app with voice commands!",
    shortAnswer: "Hello! Enroll your voice first, then verify to use navigation.",
    category: "greeting"
  },
  {
    topic: "help",
    keywords: ["help", "what can you do", "commands", "guide"],
    question: "Help",
    answer: "Available commands:\n🔐 'Enroll my voice' - Register your voiceprint (3 samples)\n🔑 'Verify my voice' - Authenticate with challenge phrase\n📍 'Open dashboard/vibrations/settings' - Navigate (after verification)\n❓ Ask any question about SynapSense",
    shortAnswer: "Enroll → Verify → Navigate. Ask questions anytime!",
    category: "support"
  }
];

const SUGGESTED_ACTIONS = [
  { text: "Enroll my voice", category: "auth", icon: "🎤" },
  { text: "Verify my voice", category: "auth", icon: "🔐" },
  { text: "What is SynapSense?", category: "qa", icon: "❓" },
  { text: "Help", category: "support", icon: "💡" },
];

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Enrollment phrases for user to speak
const ENROLLMENT_PHRASES = [
  "My voice is my password",
  "Security through sound waves",
  "SynapSense protects my home"
];

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const answerPanelRef = useRef(null);
  const lastTranscriptRef = useRef("");
  const listeningTimeoutRef = useRef(null);
  const hasProcessedRef = useRef(false);
  const voiceStreamRef = useRef(null);
  const authSessionRef = useRef(null);
  const enrollmentSamplesRef = useRef([]); // Use ref to collect samples during async enrollment

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  const [isListening, setIsListening] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Voice Auth State
  const [voiceAuthStatus, setVoiceAuthStatus] = useState("unknown");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [challengePhrase, setChallengePhrase] = useState("");
  const [authScore, setAuthScore] = useState(0);

  // Enrollment State
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentStep, setEnrollmentStep] = useState(0);
  const [enrollmentSamples, setEnrollmentSamples] = useState([]);
  const [currentEnrollPhrase, setCurrentEnrollPhrase] = useState("");

  // Get user ID from localStorage or use 'owner' as default (to match enrolled voiceprint)
  const userId = localStorage.getItem("voice_user_id") || (() => {
    // Use 'owner' as default since that's the enrolled user
    const id = "owner";
    localStorage.setItem("voice_user_id", id);
    return id;
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔌 INITIALIZE ON MOUNT
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const init = async () => {
      // Check API health
      const health = await checkAPIHealth();
      if (health.ready) {
        setVoiceAuthStatus("ready");
        console.log("✅ Voice Auth API ready:", health);
      } else {
        setVoiceAuthStatus("error");
        console.warn("⚠️ Voice Auth API not ready:", health);
      }

      // Check if already enrolled (stored in localStorage)
      const enrolled = localStorage.getItem("voice_enrolled") === "true";
      setIsEnrolled(enrolled);

      // Initialize auth session
      authSessionRef.current = new VoiceAuthSession(userId);
    };

    init();

    return () => {
      if (voiceStreamRef.current) voiceStreamRef.current.disconnect();
    };
  }, [userId]);

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔊 SPEAK
  // ═══════════════════════════════════════════════════════════════════════════
  const stopSpeaking = useCallback(() => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setStatus("idle");
    }
  }, []);

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
  // 🎤 VOICE ENROLLMENT FLOW
  // ═══════════════════════════════════════════════════════════════════════════
  const startEnrollment = useCallback(async () => {
    if (voiceAuthStatus !== "ready") {
      addMessage("assistant", "⚠️ Voice service not available. Please try later.", true);
      return;
    }

    setIsEnrolling(true);
    setEnrollmentStep(0);
    setEnrollmentSamples([]);
    enrollmentSamplesRef.current = []; // Reset ref

    addMessage("assistant", "🎤 Starting Voice Enrollment!\n\nI'll ask you to speak 3 phrases. Speak clearly after each prompt.", false, true);
    speak("Starting voice enrollment. I'll ask you to speak 3 phrases.");

    await new Promise(r => setTimeout(r, 2500));

    // Collect all 3 samples sequentially
    const samples = [];
    for (let step = 0; step < ENROLLMENT_PHRASES.length; step++) {
      const phrase = ENROLLMENT_PHRASES[step];
      setCurrentEnrollPhrase(phrase);
      setEnrollmentStep(step + 1);

      addMessage("assistant", `📢 Sample ${step + 1}/3 - Please say:\n"${phrase}"`, false, true);
      speak(`Sample ${step + 1}. Please say: ${phrase}`);

      await new Promise(r => setTimeout(r, 3000));

      // Record the sample
      addMessage("assistant", "🎙️ Recording... Speak now!", false, true);
      setStatus("listening");

      try {
        const audioBlob = await recordAudio(5000); // 5 seconds for better sample
        samples.push(audioBlob);
        enrollmentSamplesRef.current.push(audioBlob);
        console.log(`📼 Sample ${step + 1} recorded:`, audioBlob.size, 'bytes');

        addMessage("assistant", `✅ Sample ${step + 1} recorded!`, false, true);
        await new Promise(r => setTimeout(r, 1000));
      } catch (error) {
        addMessage("assistant", `❌ Recording failed: ${error.message}`, true);
        setIsEnrolling(false);
        setStatus("idle");
        return;
      }
    }

    // All samples collected - now enroll
    setCurrentEnrollPhrase("");
    addMessage("assistant", "🔄 Processing your voice samples...", false, true);
    setStatus("processing");

    try {
      console.log('📤 Sending enrollment with', samples.length, 'samples');
      const result = await enrollUser(userId, samples, true);

      if (result.success) {
        setIsEnrolled(true);
        localStorage.setItem("voice_enrolled", "true");

        addMessage("assistant", `✅ Voice Enrollment Complete!\n\n${result.message}\n\nNow say "Verify my voice" to authenticate.`, false, true, true);
        speak("Voice enrollment complete! You can now verify your voice to access navigation features.");
      } else {
        addMessage("assistant", `❌ Enrollment failed: ${result.message}`, true);
      }
    } catch (error) {
      addMessage("assistant", `❌ Enrollment error: ${error.message}`, true);
    }

    setIsEnrolling(false);
    setStatus("idle");
  }, [voiceAuthStatus, speak, userId]);

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔐 VOICE VERIFICATION (Challenge-Response)
  // ═══════════════════════════════════════════════════════════════════════════
  const performVoiceAuth = useCallback(async () => {
    if (!isEnrolled) {
      addMessage("assistant", "⚠️ You need to enroll your voice first!\n\nSay 'Enroll my voice' to register your voiceprint.", true);
      speak("Please enroll your voice first by saying: Enroll my voice");
      return;
    }

    if (voiceAuthStatus !== "ready") {
      addMessage("assistant", "⚠️ Voice authentication service not available.", true);
      return;
    }

    setStatus("authenticating");
    addMessage("assistant", "🔐 Starting voice verification...", false, true);

    try {
      // Step 1: Start challenge
      const challenge = await startChallenge(userId);

      if (!challenge.success) {
        throw new Error(challenge.message || "Failed to start challenge");
      }

      // Step 2: Show phrase
      setChallengePhrase(challenge.phrase);
      addMessage("assistant", `📢 Challenge Phrase:\n\n"${challenge.phrase}"\n\nSpeak this phrase clearly!`, false, true);
      speak(`Please say: ${challenge.phrase}`);

      await new Promise(r => setTimeout(r, 3000));

      // Step 3: Record audio AND capture browser STT simultaneously
      addMessage("assistant", "🎙️ Recording... Speak now!", false, true);
      setStatus("listening");

      // Start browser speech recognition
      let spokenText = "";
      let interimText = "";
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = true; // Enable real-time updates

        const sttPromise = new Promise((resolve) => {
          recognition.onresult = (event) => {
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }

            if (finalTranscript) {
              spokenText = finalTranscript;
              console.log("🎤 Final:", spokenText);
            }

            // Show what user is saying in real-time
            interimText = interimTranscript || finalTranscript;
            if (interimText) {
              setCurrentTranscript(`🗣️ "${interimText}"`);
            }
          };
          recognition.onerror = (e) => {
            console.warn("Browser STT error:", e.error);
            resolve("");
          };
          recognition.onend = () => {
            resolve(spokenText);
          };
        });

        recognition.start();

        // Record audio at the same time
        const audioBlob = await recordAudio(5000); // 5 seconds for better capture

        // Wait for STT to finish (with timeout)
        await Promise.race([
          sttPromise,
          new Promise(r => setTimeout(r, 6000))
        ]);

        try { recognition.stop(); } catch (e) { }
        setCurrentTranscript(""); // Clear the live transcript

        addMessage("assistant", `🔄 Verifying...\n\n🗣️ You said: "${spokenText || '(no speech detected)'}"`, false, true);
        setStatus("processing");

        // Step 4: Verify using browser STT
        const result = await verifyChallengeWithText(challenge.sessionId, audioBlob, spokenText);

        if (result.success && result.speakerMatch && result.phraseMatch) {
          setIsVerified(true);
          setAuthScore(result.speakerScore);
          authSessionRef.current?.setAuthenticated(result.speakerScore);

          addMessage("assistant", `✅ Voice Verified Successfully!\n\nConfidence: ${Math.round(result.speakerScore * 100)}%\n\nYou can now use navigation commands like:\n• "Open dashboard"\n• "Show vibrations"\n• "Go to settings"`, false, true, true);
          speak("Voice verified! You can now navigate the app with voice commands.");

        } else {
          const reason = !result.speakerMatch ? `Voice mismatch (score: ${Math.round(result.speakerScore * 100)}%)` :
            !result.phraseMatch ? `Phrase mismatch (heard: "${result.spokenText}")` :
              result.message;

          addMessage("assistant", `❌ Verification Failed\n\nReason: ${reason}\nTrials left: ${result.trialsRemaining}\n\nTry again by saying "Verify my voice"`, true);
          speak("Verification failed. " + reason);
        }
      } else {
        // Fallback: no browser STT, use backend Whisper
        const audioBlob = await recordAudio(4000);
        addMessage("assistant", "🔄 Verifying your voice...", false, true);
        setStatus("processing");

        const result = await verifyChallenge(challenge.sessionId, audioBlob);

        if (result.success && result.speakerMatch && result.phraseMatch) {
          setIsVerified(true);
          setAuthScore(result.speakerScore);
          authSessionRef.current?.setAuthenticated(result.speakerScore);
          addMessage("assistant", `✅ Voice Verified!`, false, true, true);
          speak("Voice verified!");
        } else {
          addMessage("assistant", `❌ Verification Failed: ${result.message}`, true);
          speak("Verification failed.");
        }
      }

    } catch (error) {
      addMessage("assistant", `❌ Error: ${error.message}`, true);
    }

    setChallengePhrase("");
    setStatus("idle");
  }, [isEnrolled, voiceAuthStatus, userId, speak]);

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧭 NAVIGATION COMMANDS (Requires Verification)
  // ═══════════════════════════════════════════════════════════════════════════
  const NAVIGATION_COMMANDS = [
    { pattern: /(home|dashboard|main)/, route: "/", response: "Opening dashboard" },
    { pattern: /(vibration|signal|wave)/, route: "/vibrations", response: "Showing live vibrations" },
    { pattern: /(notification|alert|intruder)/, route: "/notifications", response: "Opening notifications" },
    { pattern: /(profile|account)/, route: "/profile", response: "Opening your profile" },
    { pattern: /(setting|settings|preference)/, route: "/settings", response: "Opening settings" },
    { pattern: /(faq|help page|question)/, route: "/faqs", response: "Opening FAQs" },
    { pattern: /(about|information)/, route: "/about", response: "Opening about page" },
  ];

  const handleNavigation = useCallback((text) => {
    for (const cmd of NAVIGATION_COMMANDS) {
      if (cmd.pattern.test(text)) {
        navigate(cmd.route);
        addMessage("assistant", `🧭 ${cmd.response}`, false, false, true);
        speak(cmd.response);
        return true;
      }
    }
    return false;
  }, [navigate, speak]);

  // ═══════════════════════════════════════════════════════════════════════════
  // 💬 MESSAGE HELPER
  // ═══════════════════════════════════════════════════════════════════════════
  const addMessage = (type, text, isError = false, isSystem = false, isSuccess = false) => {
    setConversationHistory(prev => [...prev, { type, text, isError, isSystem, isSuccess }]);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔍 FIND ANSWER FROM KNOWLEDGE BASE
  // ═══════════════════════════════════════════════════════════════════════════
  const findAnswer = (query) => {
    const text = query.toLowerCase().trim();
    let bestMatch = null;
    let maxScore = 0;

    for (const entry of KNOWLEDGE_BASE) {
      let score = 0;
      for (const keyword of entry.keywords) {
        if (text.includes(keyword)) {
          score += keyword.split(" ").length;
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
  // 🎯 PROCESS INPUT
  // ═══════════════════════════════════════════════════════════════════════════
  const processInput = useCallback((input) => {
    const text = input.toLowerCase().trim();
    setStatus("processing");

    // Add user message
    addMessage("user", input);

    // COMMAND: Enroll
    if (text.includes("enroll")) {
      startEnrollment();
      return;
    }

    // COMMAND: Verify
    if (text.includes("verify") || text.includes("authenticate")) {
      performVoiceAuth();
      return;
    }

    // COMMAND: Auth Status
    if (text.includes("status") || text.includes("am i verified")) {
      if (isVerified && authSessionRef.current?.isValid()) {
        const mins = Math.round(authSessionRef.current.getRemainingTime() / 60000);
        addMessage("assistant", `✅ Verified (${Math.round(authScore * 100)}%)\nSession: ${mins} minutes remaining`);
      } else if (isEnrolled) {
        addMessage("assistant", "🔒 Enrolled but not verified.\nSay 'Verify my voice' to authenticate.");
      } else {
        addMessage("assistant", "❌ Not enrolled.\nSay 'Enroll my voice' to start.");
      }
      setStatus("idle");
      return;
    }

    // COMMAND: Logout/Reset
    if (text.includes("logout") || text.includes("reset voice")) {
      setIsVerified(false);
      authSessionRef.current?.clear();
      addMessage("assistant", "🔓 Voice session cleared. Say 'Verify my voice' to re-authenticate.");
      speak("Voice session cleared.");
      setStatus("idle");
      return;
    }

    // NAVIGATION COMMANDS - Requires verification
    const isNavCommand = NAVIGATION_COMMANDS.some(cmd => cmd.pattern.test(text));
    if (isNavCommand) {
      if (!isVerified || !authSessionRef.current?.isValid()) {
        addMessage("assistant", "🔒 Voice verification required!\n\nNavigigation commands need authentication. Say 'Verify my voice' first.", true);
        speak("Please verify your voice first to use navigation commands.");
        setStatus("idle");
        return;
      }

      if (handleNavigation(text)) {
        setStatus("idle");
        return;
      }
    }

    // Q&A - Available without verification
    const answer = findAnswer(text);
    if (answer) {
      addMessage("assistant", answer.answer);
      speak(answer.shortAnswer);
      setStatus("idle");
      return;
    }

    // Fallback
    const fallback = isEnrolled
      ? "I didn't understand. Try 'verify my voice' or ask about SynapSense."
      : "I didn't understand. Say 'enroll my voice' to start, or ask about SynapSense.";
    addMessage("assistant", fallback);
    speak(fallback);
    setStatus("idle");
  }, [startEnrollment, performVoiceAuth, handleNavigation, isVerified, isEnrolled, authScore, speak]);

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎙️ SPEECH RECOGNITION
  // ═══════════════════════════════════════════════════════════════════════════
  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      addMessage("assistant", "Speech recognition not supported. Use Chrome or Edge.", true);
      return;
    }

    if (isEnrolling) {
      addMessage("assistant", "⚠️ Please complete enrollment first!", true);
      return;
    }

    stopSpeaking();
    lastTranscriptRef.current = "";
    hasProcessedRef.current = false;

    if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) { }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setStatus("listening");
        setCurrentTranscript("");

        listeningTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && !hasProcessedRef.current) {
            if (lastTranscriptRef.current.trim()) {
              hasProcessedRef.current = true;
              processInput(lastTranscriptRef.current);
            }
            try { recognitionRef.current.stop(); } catch (e) { }
          }
        }, 8000);
      };

      recognition.onspeechend = () => {
        setTimeout(() => {
          if (recognitionRef.current && !hasProcessedRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
          }
        }, 500);
      };

      recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        const text = lastResult[0].transcript;

        lastTranscriptRef.current = text;
        setCurrentTranscript(text);

        if (lastResult.isFinal && !hasProcessedRef.current) {
          hasProcessedRef.current = true;
          setCurrentTranscript("");
          if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
          try { recognition.stop(); } catch (e) { }
          processInput(text);
        }
      };

      recognition.onerror = (event) => {
        if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
        if (event.error === "aborted") {
          if (lastTranscriptRef.current.trim() && !hasProcessedRef.current) {
            hasProcessedRef.current = true;
            processInput(lastTranscriptRef.current);
          }
        } else if (event.error !== "no-speech") {
          addMessage("assistant", `Mic error: ${event.error}`, true);
        }
        setIsListening(false);
        setStatus("idle");
      };

      recognition.onend = () => {
        if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
        if (lastTranscriptRef.current.trim() && !hasProcessedRef.current) {
          hasProcessedRef.current = true;
          processInput(lastTranscriptRef.current);
        }
        setIsListening(false);
        setCurrentTranscript("");
        setStatus(prev => prev === "listening" ? "idle" : prev);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      addMessage("assistant", `Error: ${error.message}`, true);
      setStatus("error");
      setIsListening(false);
    }
  }, [processInput, stopSpeaking, isEnrolling]);

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
  // 📋 TOGGLE PANEL
  // ═══════════════════════════════════════════════════════════════════════════
  const togglePanel = () => {
    stopSpeaking();
    setIsPanelOpen(!isPanelOpen);
    if (!isPanelOpen && conversationHistory.length === 0) {
      const welcome = isEnrolled
        ? isVerified
          ? "Welcome back! ✅ Voice verified. You can navigate with voice commands."
          : "Welcome! 🔐 Say 'Verify my voice' to authenticate and unlock navigation."
        : "Hello! 🎤 Say 'Enroll my voice' to register your voiceprint first.";
      addMessage("assistant", welcome);
    }
  };

  // Scroll to bottom
  useEffect(() => {
    if (answerPanelRef.current) {
      answerPanelRef.current.scrollTop = answerPanelRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (voiceStreamRef.current) voiceStreamRef.current.disconnect();
      speechSynthesis.cancel();
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎨 STATUS HELPERS
  // ═══════════════════════════════════════════════════════════════════════════
  const getStatusStyle = () => {
    if (isVerified) return "bg-green-600 shadow-green-500/50";
    if (isEnrolled) return "bg-yellow-600 shadow-yellow-500/50";
    switch (status) {
      case "listening": return "bg-green-500 animate-pulse shadow-green-500/50";
      case "processing": return "bg-yellow-500 shadow-yellow-500/50";
      case "speaking": return "bg-blue-500 shadow-blue-500/50";
      case "authenticating": return "bg-purple-500 animate-pulse shadow-purple-500/50";
      default: return "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/50";
    }
  };

  const getStatusText = () => {
    if (isEnrolling) return `Enrolling... (${enrollmentStep}/3)`;
    switch (status) {
      case "listening": return "🎧 Listening...";
      case "processing": return "⚙️ Processing...";
      case "speaking": return "🔊 Speaking...";
      case "authenticating": return "🔐 Authenticating...";
      default: return isVerified ? "✅ Verified" : isEnrolled ? "🔒 Enrolled" : "❌ Not Enrolled";
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* Floating Button */}
      <button
        onClick={togglePanel}
        className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full 
                   flex items-center justify-center text-white text-2xl
                   shadow-lg transition-all duration-300 transform
                   ${isPanelOpen ? "rotate-45 bg-red-500 hover:bg-red-600" : getStatusStyle()}
                   hover:scale-110`}
        title={isPanelOpen ? "Close" : "Voice Assistant"}
      >
        {isPanelOpen ? "✕" : isVerified ? "🔓" : isEnrolled ? "🔐" : "🎙️"}
      </button>

      {/* Panel */}
      {isPanelOpen && (
        <div className="fixed bottom-24 right-6 z-[9998] w-96 h-[500px]
                        bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
                        rounded-2xl shadow-2xl border border-slate-700/50
                        flex flex-col backdrop-blur-xl"
          style={{ animation: 'slideUp 0.3s ease-out' }}>

          {/* Header */}
          <div className={`px-5 py-4 flex items-center justify-between flex-shrink-0 ${isVerified ? "bg-gradient-to-r from-green-600 to-emerald-600" :
            isEnrolled ? "bg-gradient-to-r from-yellow-600 to-orange-600" :
              "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700"
            } rounded-t-2xl`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                <span className="text-xl">{isVerified ? "🔓" : isEnrolled ? "🔐" : "🎤"}</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Voice Assistant</h3>
                <p className="text-white/80 text-xs">{getStatusText()}</p>
              </div>
            </div>
            <button onClick={() => { stopSpeaking(); setIsPanelOpen(false); }} className="text-white/70 hover:text-white p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Enrollment Phrase Display */}
          {currentEnrollPhrase && (
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-b border-indigo-500/30 flex-shrink-0">
              <p className="text-xs text-indigo-300 mb-1">🎤 Say this phrase ({enrollmentStep}/3):</p>
              <p className="text-lg font-bold text-white text-center">"{currentEnrollPhrase}"</p>
            </div>
          )}

          {/* Challenge Phrase Display */}
          {challengePhrase && (
            <div className="px-4 py-3 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-b border-purple-500/30 flex-shrink-0">
              <p className="text-xs text-purple-300 mb-1">🔐 Challenge phrase:</p>
              <p className="text-lg font-bold text-white text-center">"{challengePhrase}"</p>
            </div>
          )}

          {/* LIVE SPEECH DISPLAY - Shows what user is saying in real-time */}
          {currentTranscript && status === "listening" && (
            <div className="px-4 py-3 bg-gradient-to-r from-green-600/40 to-emerald-600/40 border-b border-green-500/30 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                <p className="text-xs text-green-300">🎙️ You're saying:</p>
              </div>
              <p className="text-lg font-bold text-white text-center">{currentTranscript}</p>
            </div>
          )}

          {/* Conversation - Scrollable Area */}
          <div
            ref={answerPanelRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 voice-chat-scroll"
          >
            {conversationHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.type === "user" ? "bg-indigo-600 text-white rounded-br-sm" :
                  msg.isError ? "bg-red-600/30 text-red-200 border border-red-500/30 rounded-bl-sm" :
                    msg.isSuccess ? "bg-green-600/30 text-green-200 border border-green-500/30 rounded-bl-sm" :
                      msg.isSystem ? "bg-slate-600/50 text-slate-300 rounded-bl-sm italic" :
                        "bg-slate-700/80 text-slate-200 rounded-bl-sm"
                  }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Suggested Actions */}
          {conversationHistory.length <= 1 && (
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_ACTIONS.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => processInput(a.text)}
                    disabled={isEnrolling}
                    className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1
                               ${a.category === "auth" ? "bg-purple-700/50 text-purple-300 border-purple-500/50" :
                        "bg-slate-700/50 text-indigo-300 border-slate-600/50"}
                               border hover:opacity-80 transition-all disabled:opacity-50`}
                  >
                    <span>{a.icon}</span> {a.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-slate-800/50 border-t border-slate-700/50">
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={isEnrolling ? "Enrollment in progress..." : "Type or speak..."}
                disabled={isEnrolling}
                className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl 
                           px-4 py-3 text-white placeholder-slate-400 text-sm
                           focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={startListening}
                disabled={isListening || isEnrolling}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg
                           ${isListening ? "bg-green-500 animate-pulse" : "bg-indigo-600 hover:bg-indigo-500"}
                           text-white disabled:opacity-50`}
              >
                {isListening ? "🎧" : "🎙️"}
              </button>
              <button
                type="submit"
                disabled={!textInput.trim() || isEnrolling}
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 
                           text-white flex items-center justify-center disabled:opacity-50"
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
              {voiceAuthStatus === "ready" ? "🟢" : "🔴"} Voice Auth •
              {isVerified ? " ✅ Verified" : isEnrolled ? " 🔐 Enrolled" : " ❌ Not Enrolled"}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
      `}</style>
    </>
  );
}
