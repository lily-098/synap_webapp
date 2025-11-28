import { AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';

function Notifications({ darkMode }) {
  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'Human Detection Alert',
      message: 'Unauthorized human presence detected in Zone A at 14:23. Immediate attention required.',
      timestamp: '2 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'info',
      title: 'System Update',
      message: 'Vibration monitoring system successfully updated to version 2.4.1 with improved detection algorithms.',
      timestamp: '15 minutes ago',
      read: false,
    },
    {
      id: 3,
      type: 'warning',
      title: 'Noise Threshold Exceeded',
      message: 'Environmental noise levels exceeded normal threshold in Zone C. Possible machinery malfunction detected.',
      timestamp: '1 hour ago',
      read: true,
    },
    {
      id: 4,
      type: 'success',
      title: 'Detection Accuracy Report',
      message: 'Weekly detection accuracy maintained at 98.7%. All systems operating within optimal parameters.',
      timestamp: '3 hours ago',
      read: true,
    },
    {
      id: 5,
      type: 'info',
      title: 'Animal Activity',
      message: 'Increased animal movement detected in Zone B during twilight hours. Pattern consistent with local wildlife.',
      timestamp: '5 hours ago',
      read: true,
    },
    {
      id: 6,
      type: 'warning',
      title: 'Sensor Calibration Required',
      message: 'Sensor S-04 requires calibration. Schedule maintenance within the next 48 hours to ensure accuracy.',
      timestamp: '8 hours ago',
      read: true,
    },
    {
      id: 7,
      type: 'success',
      title: 'System Health Check',
      message: 'All 12 sensors passed automated health check. Network connectivity stable at 99.9% uptime.',
      timestamp: '12 hours ago',
      read: true,
    },
    {
      id: 8,
      type: 'info',
      title: 'Historical Data Export',
      message: 'Monthly detection data export completed successfully. Report available for download in dashboard.',
      timestamp: '1 day ago',
      read: true,
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-6 h-6" />;
      case 'success':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-red-50 dark:bg-red-900',
          border: 'border-red-200 dark:border-red-700',
          icon: 'text-red-600 dark:text-red-400',
          title: 'text-red-800 dark:text-red-200',
          iconBg: 'bg-red-100 dark:bg-red-800',
        };
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900',
          border: 'border-green-200 dark:border-green-700',
          icon: 'text-green-600 dark:text-green-400',
          title: 'text-green-800 dark:text-green-200',
          iconBg: 'bg-green-100 dark:bg-green-800',
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900',
          border: 'border-blue-200 dark:border-blue-700',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-800 dark:text-blue-200',
          iconBg: 'bg-blue-100 dark:bg-blue-800',
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-2xl p-8 md:p-12 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Notifications</h1>
          <p className="text-white text-lg">
            Stay informed with real-time alerts and system updates. Critical warnings appear at the top for immediate attention.
          </p>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => {
            const colors = getColors(notification.type);
            return (
              <div
                key={notification.id}
                className={`${colors.bg} ${colors.border} border-l-4 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all ${
                  !notification.read ? 'ring-2 ring-blue-400 dark:ring-blue-600' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`${colors.iconBg} p-3 rounded-lg ${colors.icon}`}>
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`text-lg font-bold ${colors.title} ${!notification.read ? 'font-extrabold' : ''}`}>
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </h3>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{notification.timestamp}</span>
                      </div>
                    </div>

                    <p className={`text-gray-700 dark:text-gray-300 ${!notification.read ? 'font-semibold' : ''}`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Notification Legend</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 dark:bg-red-800 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">Warning</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Requires attention</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">Information</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">General updates</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-green-100 dark:bg-green-800 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">Success</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Positive updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
