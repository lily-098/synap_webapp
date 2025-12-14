import { useEffect, useState, useCallback, useRef } from "react";
import { AlertTriangle, Info, CheckCircle, Clock, Volume2, VolumeX } from "lucide-react";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [alarmActive, setAlarmActive] = useState(false);
  const [alarmMuted, setAlarmMuted] = useState(false);

  const alarmSoundRef = useRef(null);

  // Load alarm sound
  useEffect(() => {
    alarmSoundRef.current = new Audio("/race-starts-beeps-125125.mp3");
    alarmSoundRef.current.volume = 1.0;
    alarmSoundRef.current.loop = true;
  }, []);

  // Unlock audio on first click
  useEffect(() => {
    const unlock = () => {
      alarmSoundRef.current.play().catch(() => {});
      alarmSoundRef.current.pause();
      alarmSoundRef.current.currentTime = 0;
      window.removeEventListener("pointerdown", unlock);
    };

    window.addEventListener("pointerdown", unlock);
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  // Ask notification permission
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // Handle incoming notification
  const handleReceiveNotification = useCallback(
    (payload) => {
      const item = {
        id: Date.now(),
        type: payload.type ?? "info",
        title: payload.title ?? "Notification",
        message: payload.message ?? "Event occurred.",
        timestamp: payload.timestamp ?? "Just now",
        read: false,
      };

      setNotifications((prev) => [item, ...prev]);

      if (item.type === "warning") {
        setAlarmActive(true);

        if (!alarmMuted) {
          alarmSoundRef.current.currentTime = 0;
          alarmSoundRef.current.play().catch(() => {});
        }
      }

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(item.title, { body: item.message });
      }
    },
    [alarmMuted]
  );

  // Stop alarm
  const stopAlarm = () => {
    setAlarmActive(false);
    alarmSoundRef.current.pause();
    alarmSoundRef.current.currentTime = 0;
  };

  const NormalHeader = () => (
    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-10 mb-6 relative">
      <h1 className="text-white text-5xl font-extrabold">Notifications</h1>
      <p className="text-white text-lg mt-2">Real-time alerts will appear below.</p>

      <button
        onClick={() => {
          setAlarmMuted(!alarmMuted);
          alarmSoundRef.current.pause();
        }}
        className="absolute top-4 right-4 p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white"
      >
        {alarmMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>
    </div>
  );

  const WarningHeader = () => (
    <div
      onClick={stopAlarm}
      className="cursor-pointer bg-gradient-to-r from-red-600 to-orange-500
      rounded-2xl shadow-2xl p-10 mb-6 flex items-center justify-between animate-pulse relative"
    >
      <div>
        <h1 className="text-white text-5xl font-extrabold drop-shadow-lg">⚠ Warning Active!</h1>
        <p className="text-white text-lg opacity-90 mt-2">
          A critical alert has been detected by the system.
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setAlarmMuted(!alarmMuted);
          alarmSoundRef.current.pause();
        }}
        className="absolute top-4 right-4 p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white"
      >
        {alarmMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>
    </div>
  );

  const getIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-6 h-6" />;
      case "success":
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-red-50 dark:bg-red-900",
          border: "border-red-200 dark:border-red-700",
          icon: "text-red-600 dark:text-red-400",
          title: "text-red-800 dark:text-red-200",
          iconBg: "bg-red-100 dark:bg-red-800",
        };
      case "success":
        return {
          bg: "bg-green-50 dark:bg-green-900",
          border: "border-green-200 dark:border-green-700",
          icon: "text-green-600 dark:text-green-400",
          title: "text-green-800 dark:text-green-200",
          iconBg: "bg-green-100 dark:bg-green-800",
        };
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-900",
          border: "border-blue-200 dark:border-blue-700",
          icon: "text-blue-600 dark:text-blue-400",
          title: "text-blue-800 dark:text-blue-200",
          iconBg: "bg-blue-100 dark:bg-blue-800",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {alarmActive ? <WarningHeader /> : <NormalHeader />}

        {/* Manual Test */}
        <div className="flex justify-center mb-10">
          <button
            onClick={() =>
              handleReceiveNotification({
                type: "warning",
                title: "Manual Test Alert",
                message: "This is a manually triggered warning alert.",
                timestamp: "Just now",
              })
            }
            className="px-8 py-3 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition text-lg"
          >
            Trigger Test Alert
          </button>
        </div>

        {/* Notification List */}
        <div className="space-y-4">
          {notifications.length === 0 && (
            <p className="text-center text-gray-600 dark:text-gray-300">
              No notifications yet.
            </p>
          )}

          {notifications.map((n) => {
            const colors = getColors(n.type);
            return (
              <div
                key={n.id}
                className={`${colors.bg} ${colors.border} border-l-4 p-6 rounded-xl shadow`}
              >
                <div className="flex space-x-4">
                  <div className={`${colors.iconBg} p-3 rounded-lg ${colors.icon}`}>
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className={`text-lg font-bold ${colors.title}`}>{n.title}</h3>
                      <span className="text-gray-500 text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-1" /> {n.timestamp}
                      </span>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300">{n.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <NotificationLegend />
      </div>
    </div>
  );
}

function NotificationLegend() {
  return (
    <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <h3 className="text-lg font-bold mb-4 dark:text-white">Notification Legend</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LegendItem
          icon={<AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />}
          title="Warning"
          desc="Critical alert. Needs attention."
        />
        <LegendItem
          icon={<Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          title="Information"
          desc="General update."
        />
        <LegendItem
          icon={<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
          title="Success"
          desc="Positive event."
        />
      </div>
    </div>
  );
}

function LegendItem({ icon, title, desc }) {
  return (
    <div className="flex items-center space-x-3">
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">{icon}</div>
      <div>
        <p className="font-semibold dark:text-white">{title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

export default Notifications;