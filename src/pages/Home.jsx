import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowRight, Activity, Shield, Zap } from 'lucide-react';

function Home({ darkMode }) {
  const navigate = useNavigate();

  const detectionData = [
    { category: 'Animals', detected: 145, color: '#10b981' },
    { category: 'Humans', detected: 89, color: '#3b82f6' },
    { category: 'Noise', detected: 234, color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-2xl p-8 md:p-12 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-12 h-12 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Welcome to SynapSense</h1>
          </div>
          <p className="text-white text-lg md:text-xl leading-relaxed max-w-4xl">
            SynapSense is an advanced vibration-based detection system that monitors and analyzes seismic signals in real-time.
            Our intelligent platform uses cutting-edge signal processing algorithms to differentiate between animals, humans, and environmental noise,
            providing accurate detection and immediate alerts for security and monitoring applications.
            Experience precision, reliability, and peace of mind with our state-of-the-art technology.
          </p>
          <button
            onClick={() => navigate('/notifications')}
            className="mt-8 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center space-x-2"
          >
            <span>Go to Notifications</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Real-Time Monitoring</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Continuous vibration signal analysis with instant detection capabilities
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Intelligent Detection</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Advanced algorithms distinguish between animals, humans, and noise
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Instant Alerts</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Immediate notifications when threats or anomalies are detected
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transition-colors duration-300">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Detection Statistics Dashboard</h2>

          <div className="mb-8">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={detectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis
                  dataKey="category"
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  style={{ fontSize: '14px', fontWeight: '600' }}
                />
                <YAxis
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  style={{ fontSize: '14px', fontWeight: '600' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    color: darkMode ? '#ffffff' : '#000000'
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                />
                <Bar
                  dataKey="detected"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  name="Detections"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-green-800 dark:text-green-100 mb-2">Animals Detected</h3>
              <p className="text-4xl font-bold text-green-600 dark:text-green-300 mb-3">145</p>
              <p className="text-green-700 dark:text-green-200 text-sm">
                Wildlife activity detected through low-frequency vibration patterns typical of animal movement across monitored zones.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-800 dark:text-blue-100 mb-2">Humans Detected</h3>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-300 mb-3">89</p>
              <p className="text-blue-700 dark:text-blue-200 text-sm">
                Human presence identified through distinctive footstep patterns and rhythmic vibration signatures unique to bipedal motion.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-amber-800 dark:text-amber-100 mb-2">Noise Events</h3>
              <p className="text-4xl font-bold text-amber-600 dark:text-amber-300 mb-3">234</p>
              <p className="text-amber-700 dark:text-amber-200 text-sm">
                Environmental noise from weather, machinery, and natural phenomena filtered and categorized for accurate threat assessment.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Detailed Analysis</h3>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong className="text-gray-900 dark:text-white">Overall Performance:</strong> The system has processed and analyzed over 468 detection events in the current monitoring period, demonstrating exceptional accuracy and reliability.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Detection Trends:</strong> Noise events constitute the highest category due to environmental factors and weather conditions. Human detection shows moderate activity during operational hours, while animal movements are more frequent during dawn and dusk periods.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">System Status:</strong> All sensors are functioning optimally with 99.8% uptime. Signal processing algorithms are operating within normal parameters, ensuring continuous and reliable monitoring coverage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
