import { useEffect, useState, useCallback, useRef } from "react";
import { AlertTriangle, Info, CheckCircle, Clock } from "lucide-react";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [alarmActive, setAlarmActive] = useState(false);

  const alarmSoundRef = useRef(null);

  // ------------------------------------------------------
  // 🔊 Load alarm sound
  // ------------------------------------------------------
  useEffect(() => {
    alarmSoundRef.current = new Audio("/alarm.mp3");
    alarmSoundRef.current.volume = 1.0;
  }, []);

  // ------------------------------------------------------
  // 🔔 Request push notification permission
  // ------------------------------------------------------
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // ------------------------------------------------------
  // 🚨 Handle incoming notifications
  // ------------------------------------------------------
  const handleReceiveNotification = useCallback((payload) => {
    const item = {
      id: Date.now(),
      type: payload.type ?? "info",
      title: payload.title ?? "Notification",
      message: payload.message ?? "Event occurred.",
      timestamp: payload.timestamp ?? "Just now",
      read: false,
    };

    setNotifications((prev) => [item, ...prev]);

    // If WARNING → activate alarm + sound
    if (item.type === "warning") {
      setAlarmActive(true);
      try {
        alarmSoundRef.current.currentTime = 0;
        alarmSoundRef.current.play();
      } catch (err) {
        console.log("User interaction needed before sound can play.");
      }
    }

    // System/browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(item.title, { body: item.message });
    }
  }, []);

  // ------------------------------------------------------
  // 🧪 10-second test warning (remove if not needed)
  // ------------------------------------------------------
  useEffect(() => {
    const t = setTimeout(() => {
      handleReceiveNotification({
        type: "warning",
        title: "Test Alarm Trigger",
        message: "This is a demo warning triggered after 10 seconds.",
        timestamp: "Just now",
      });
    }, 10000);

    return () => clearTimeout(t);
  }, [handleReceiveNotification]);

  // ------------------------------------------------------
  // 🚫 Stop Alarm
  // ------------------------------------------------------
  const stopAlarm = () => {
    setAlarmActive(false);
    alarmSoundRef.current.pause();
    alarmSoundRef.current.currentTime = 0;
  };

  // ------------------------------------------------------
  // 🔵 NORMAL HEADER
  // ------------------------------------------------------
  const NormalHeader = () => (
    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-10 mb-12">
      <h1 className="text-white text-5xl font-extrabold">Notifications</h1>
      <p className="text-white text-lg mt-2">Real-time alerts will appear below.</p>
    </div>
  );

  // ------------------------------------------------------
  // 🔴 WARNING HEADER (SIREN MODE)
  // ------------------------------------------------------
  const WarningHeader = () => (
    <div
      onClick={stopAlarm}
      className="cursor-pointer bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl shadow-2xl p-10 mb-12 flex items-center justify-between animate-pulse"
    >
      <div>
        <h1 className="text-white text-5xl font-extrabold drop-shadow-lg">
          ⚠ Warning Active!
        </h1>
        <p className="text-white text-lg opacity-90 mt-2">
          A critical alert has been detected by the system.
        </p>
      </div>
    </div>
  );

  // ------------------------------------------------------
  // 🎨 Icon + color helpers
  // ------------------------------------------------------
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

        {/* 🔄 Use header based on alarmActive */}
        {alarmActive ? <WarningHeader /> : <NormalHeader />}

        {/* ----------------------
            Notification List
        ----------------------- */}
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
                      <h3 className={`text-lg font-bold ${colors.title}`}>
                        {n.title}
                      </h3>
                      <span className="text-gray-500 text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {n.timestamp}
                      </span>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300">{n.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ----------------------
            LEGEND
        ----------------------- */}
        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h3 className="text-lg font-bold mb-4 dark:text-white">Notification Legend</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Warning */}
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 dark:bg-red-800 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-semibold dark:text-white">Warning</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Critical alert. Needs attention.
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold dark:text-white">Information</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  General update.
                </p>
              </div>
            </div>

            {/* Success */}
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 dark:bg-green-800 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold dark:text-white">Success</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Positive event.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Notifications;
