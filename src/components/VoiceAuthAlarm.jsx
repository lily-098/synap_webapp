import { useState, useEffect, useRef } from "react";
import { Home, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import ALARM_CONFIG from "../config/alarmConfig";

/**
 * Voice Authentication Alarm System
 * 
 * Monitors voice authentication and triggers alarms based on authentication status:
 * - Authenticated = "HOME" (safe)
 * - Not Authenticated = "INTRUDER" (alert)
 * 
 * ⚠️ NOTE: Automatic re-authentication has been DISABLED to prevent interference
 * with voice commands. Users should manually authenticate when needed.
 */
const VoiceAuthAlarm = ({
    isVerified,
    currentUser,
    onReauthRequest,
    vibrationThreshold: initialThreshold = ALARM_CONFIG.VIBRATION_THRESHOLD
}) => {
    const [alarmStatus, setAlarmStatus] = useState("standby"); // standby, home, intruder
    const [lastAuthTime, setLastAuthTime] = useState(null);
    const [timeSinceAuth, setTimeSinceAuth] = useState(0);
    const [alarmHistory, setAlarmHistory] = useState([]);
    const reauthTimer = useRef(null);
    const updateTimer = useRef(null);

    // Adjustable vibration threshold with localStorage persistence
    const [vibrationThreshold, setVibrationThreshold] = useState(() => {
        const stored = localStorage.getItem('synap_vibration_threshold');
        return stored ? parseFloat(stored) : initialThreshold;
    });

    // Save threshold to localStorage when changed
    const handleThresholdChange = (newValue) => {
        const value = parseFloat(newValue);
        setVibrationThreshold(value);
        localStorage.setItem('synap_vibration_threshold', value.toString());
    };

    // Re-authentication interval from config
    const REAUTH_INTERVAL = ALARM_CONFIG.REAUTH_INTERVAL;

    // Update alarm status based on authentication
    useEffect(() => {
        if (isVerified) {
            setAlarmStatus("home");
            setLastAuthTime(Date.now());
            addToHistory("HOME", `Authenticated as ${currentUser || "owner"}`, "success");
        } else {
            // Only trigger intruder if we previously had auth (not on initial load)
            if (lastAuthTime !== null) {
                setAlarmStatus("intruder");
                addToHistory("INTRUDER", "Unauthorized access attempt detected", "danger");

                // Play alarm sound (optional)
                playAlarmSound();
            }
        }
    }, [isVerified, currentUser]);

    // ⚠️ AUTOMATIC RE-AUTHENTICATION DISABLED
    // 
    // This was causing interference with voice commands - when user clicked "VOICE COMMAND",
    // the automatic re-auth would trigger every 10 seconds and interrupt the voice listening flow.
    // 
    // Users should manually authenticate when needed using the "AUTHENTICATE" button,
    // or the continuous WebSocket streaming handles real-time voice verification automatically.

    /* DISABLED: Timer for automatic re-authentication
    useEffect(() => {
        if (isVerified && onReauthRequest) {
            // Clear any existing timer
            if (reauthTimer.current) {
                clearInterval(reauthTimer.current);
            }

            // Set up new timer for re-authentication
            reauthTimer.current = setInterval(() => {
                console.log("🔔 Re-authentication triggered (10 second interval)");
                onReauthRequest();
            }, REAUTH_INTERVAL);

            // Cleanup on unmount or when isVerified changes
            return () => {
                if (reauthTimer.current) {
                    clearInterval(reauthTimer.current);
                }
            };
        }
    }, [isVerified, onReauthRequest]);
    */

    // Update time since last auth
    useEffect(() => {
        if (lastAuthTime) {
            updateTimer.current = setInterval(() => {
                setTimeSinceAuth(Date.now() - lastAuthTime);
            }, 1000);

            return () => {
                if (updateTimer.current) {
                    clearInterval(updateTimer.current);
                }
            };
        }
    }, [lastAuthTime]);

    const addToHistory = (type, message, severity) => {
        const entry = {
            id: Date.now(),
            type,
            message,
            severity,
            timestamp: new Date().toLocaleTimeString()
        };

        setAlarmHistory(prev => [entry, ...prev].slice(0, 10)); // Keep last 10 entries
    };

    const playAlarmSound = () => {
        // Only play if enabled in config
        if (!ALARM_CONFIG.ENABLE_AUDIO_ALARM) return;

        // Simple alarm beep using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = ALARM_CONFIG.ALARM_SOUND.frequency;
            oscillator.type = ALARM_CONFIG.ALARM_SOUND.waveType;

            gainNode.gain.setValueAtTime(ALARM_CONFIG.ALARM_SOUND.volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + ALARM_CONFIG.ALARM_SOUND.duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + ALARM_CONFIG.ALARM_SOUND.duration);
        } catch (error) {
            console.error("Failed to play alarm sound:", error);
        }
    };

    const formatTime = (ms) => {
        const seconds = Math.floor(ms / 1000);
        return `${seconds}s`;
    };

    const getStatusColor = () => {
        switch (alarmStatus) {
            case "home":
                return "bg-green-500/20 border-green-500/50 text-green-400";
            case "intruder":
                return "bg-red-500/20 border-red-500/50 text-red-400";
            default:
                return "bg-gray-500/20 border-gray-500/50 text-gray-400";
        }
    };

    const getStatusIcon = () => {
        switch (alarmStatus) {
            case "home":
                return <ShieldCheck className="w-6 h-6" />;
            case "intruder":
                return <ShieldAlert className="w-6 h-6 animate-pulse" />;
            default:
                return <Home className="w-6 h-6" />;
        }
    };

    return (
        <div className="fixed top-4 right-4 z-40 w-80 font-mono">
            {/* Main Alarm Status */}
            <div className={`${getStatusColor()} border-2 rounded-xl p-4 backdrop-blur-sm shadow-2xl transition-all duration-300`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        {getStatusIcon()}
                        <div>
                            <div className="text-lg font-bold tracking-wider">
                                {alarmStatus === "home" && "HOME"}
                                {alarmStatus === "intruder" && "INTRUDER"}
                                {alarmStatus === "standby" && "STANDBY"}
                            </div>
                            <div className="text-xs opacity-60">Voice Auth Alarm</div>
                        </div>
                    </div>

                    {/* Time since last auth */}
                    {lastAuthTime && (
                        <div className="text-right">
                            <div className="text-xs opacity-60">Last Auth</div>
                            <div className="text-sm font-bold">{formatTime(timeSinceAuth)}</div>
                        </div>
                    )}
                </div>

                {/* Status Message */}
                <div className="bg-black/30 rounded-lg p-3 mb-3">
                    <div className="text-xs">
                        {alarmStatus === "home" && (
                            <>
                                <div className="flex items-center gap-2 mb-1">
                                    <Home className="w-4 h-4" />
                                    <span className="font-bold">AUTHORIZED ACCESS</span>
                                </div>
                                <div className="opacity-70">
                                    User: {currentUser || "owner"}
                                </div>
                                <div className="opacity-70 text-slate-500">
                                    Manual re-auth when needed
                                </div>
                            </>
                        )}
                        {alarmStatus === "intruder" && (
                            <>
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="font-bold">UNAUTHORIZED ACCESS</span>
                                </div>
                                <div className="opacity-70">
                                    Voice authentication failed
                                </div>
                                <div className="opacity-70">
                                    Security alert triggered
                                </div>
                            </>
                        )}
                        {alarmStatus === "standby" && (
                            <>
                                <div className="opacity-70">
                                    Waiting for authentication...
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Vibration Threshold Slider */}
                <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-2">
                        <span className="opacity-60">Sensit Threshold</span>
                        <span className="font-bold text-cyan-400">{(vibrationThreshold * 100).toFixed(0)}%</span>
                    </div>

                    {/* Interactive Slider */}
                    <div className="relative">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={vibrationThreshold}
                            onChange={(e) => handleThresholdChange(e.target.value)}
                            className="w-full h-3 bg-transparent rounded-full appearance-none cursor-pointer
                                     [&::-webkit-slider-thumb]:appearance-none 
                                     [&::-webkit-slider-thumb]:w-5 
                                     [&::-webkit-slider-thumb]:h-5 
                                     [&::-webkit-slider-thumb]:rounded-full 
                                     [&::-webkit-slider-thumb]:bg-cyan-400 
                                     [&::-webkit-slider-thumb]:shadow-lg 
                                     [&::-webkit-slider-thumb]:shadow-cyan-400/50
                                     [&::-webkit-slider-thumb]:hover:scale-110
                                     [&::-webkit-slider-thumb]:transition-transform
                                     [&::-webkit-slider-thumb]:cursor-grab
                                     [&::-webkit-slider-thumb]:active:cursor-grabbing
                                     [&::-moz-range-thumb]:w-5 
                                     [&::-moz-range-thumb]:h-5 
                                     [&::-moz-range-thumb]:rounded-full 
                                     [&::-moz-range-thumb]:bg-cyan-400 
                                     [&::-moz-range-thumb]:border-0
                                     [&::-moz-range-thumb]:shadow-lg 
                                     [&::-moz-range-thumb]:shadow-cyan-400/50"
                            style={{
                                background: `linear-gradient(to right, 
                                    rgb(34, 197, 94) 0%, 
                                    rgb(234, 179, 8) ${vibrationThreshold * 100}%, 
                                    rgba(0, 0, 0, 0.3) ${vibrationThreshold * 100}%, 
                                    rgba(0, 0, 0, 0.3) 100%)`
                            }}
                        />
                    </div>

                    {/* Labels */}
                    <div className="flex justify-between text-[10px] opacity-50 mt-1">
                        <span>Low</span>
                        <span>Sensitivity</span>
                        <span>High</span>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/30 rounded p-2 text-center">
                        <div className="text-xs opacity-60">Status</div>
                        <div className="text-sm font-bold uppercase">{alarmStatus}</div>
                    </div>
                    <div className="bg-black/30 rounded p-2 text-center">
                        <div className="text-xs opacity-60">Auto Reauth</div>
                        <div className="text-sm font-bold text-slate-500">OFF</div>
                    </div>
                </div>
            </div>

            {/* Alarm History */}
            {alarmHistory.length > 0 && (
                <div className="mt-3 bg-gray-900/90 border border-gray-700 rounded-xl p-3 backdrop-blur-sm shadow-xl max-h-48 overflow-y-auto">
                    <div className="text-xs font-bold tracking-wider mb-2 text-gray-400">
                        ALARM HISTORY
                    </div>
                    <div className="space-y-2">
                        {alarmHistory.map((entry) => (
                            <div
                                key={entry.id}
                                className={`p-2 rounded text-xs ${entry.severity === "success"
                                    ? "bg-green-500/10 border border-green-500/30 text-green-400"
                                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold">{entry.type}</span>
                                    <span className="opacity-60">{entry.timestamp}</span>
                                </div>
                                <div className="opacity-80">{entry.message}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceAuthAlarm;
