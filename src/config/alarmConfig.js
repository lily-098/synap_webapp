/**
 * Voice Authentication Alarm System Configuration
 * 
 * Configure alarm behavior, thresholds, and settings
 */

export const ALARM_CONFIG = {
    // Re-authentication interval in milliseconds
    REAUTH_INTERVAL: 10000, // 10 seconds

    // Vibration threshold for triggering alarms (0-1)
    // Higher values = more sensitive
    VIBRATION_THRESHOLD: 0.7, // 70%

    // Enable/disable audio alarm on intruder detection
    ENABLE_AUDIO_ALARM: true,

    // Audio alarm settings
    ALARM_SOUND: {
        frequency: 1000, // Hz
        duration: 0.5,   // seconds
        volume: 0.3,     // 0-1
        waveType: 'sine' // 'sine', 'square', 'triangle', 'sawtooth'
    },

    // Maximum number of history entries to keep
    MAX_HISTORY_ENTRIES: 10,

    // Auto-hide alarm after successful auth (in ms, 0 = never)
    AUTO_HIDE_DELAY: 0,

    // Show alarm history by default
    SHOW_HISTORY_DEFAULT: true,

    // Notification messages
    MESSAGES: {
        HOME: "AUTHORIZED ACCESS",
        INTRUDER: "UNAUTHORIZED ACCESS",
        STANDBY: "Waiting for authentication...",
        REAUTH_REQUIRED: "Re-authentication required",
    }
};

export default ALARM_CONFIG;
