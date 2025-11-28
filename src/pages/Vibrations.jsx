import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Calendar } from 'lucide-react';

function Vibrations({ darkMode }) {
  const [selectedDate, setSelectedDate] = useState('2025-11-27');

  const vibrationData = Array.from({ length: 50 }, (_, i) => ({
    time: i * 0.1,
    amplitude: Math.sin(i * 0.5) * 0.8 + Math.random() * 0.2,
  }));

  const fftData = Array.from({ length: 30 }, (_, i) => ({
    frequency: i * 10,
    magnitude: Math.abs(Math.sin(i * 0.3)) * (100 - i * 2) + Math.random() * 10,
  }));

  const historicalDates = [
    { date: '2025-11-27', label: 'Today' },
    { date: '2025-11-26', label: 'Yesterday' },
    { date: '2025-11-25', label: '2 days ago' },
    { date: '2025-11-24', label: '3 days ago' },
  ];

  const getHistoricalData = (date) => {
    return Array.from({ length: 50 }, (_, i) => ({
      time: i * 0.1,
      amplitude: Math.sin(i * 0.5 + date.length) * 0.6 + Math.random() * 0.3,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl shadow-2xl p-8 md:p-12 mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-12 h-12 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Live Vibration Signal Monitoring</h1>
          </div>
          <p className="text-white text-lg leading-relaxed">
            This page displays real-time vibration signal processing and analysis. The system continuously monitors seismic activity,
            processes raw sensor data through advanced filtering algorithms, and performs frequency domain analysis using Fast Fourier Transform (FFT)
            to identify and classify different types of vibration signatures.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Live Vibration Waveform</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vibrationData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis
                  dataKey="time"
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amplitude"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">FFT Frequency Analysis</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fftData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis
                  dataKey="frequency"
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  label={{ value: 'Magnitude', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar
                  dataKey="magnitude"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Detailed Analysis</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div className="bg-blue-50 dark:bg-blue-900 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2">Signal Characteristics</h3>
              <p>
                Current vibration signature shows periodic oscillations with amplitude range of ±0.8 units.
                The waveform exhibits clear sinusoidal patterns with minor random noise components,
                indicating stable environmental conditions with minimal disturbances.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900 rounded-xl p-6">
              <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">Frequency Domain Analysis</h3>
              <p>
                FFT analysis reveals dominant frequency components in the 0-100 Hz range.
                Peak magnitudes are concentrated in lower frequencies (0-50 Hz), typical of seismic and structural vibrations.
                Higher frequency components show gradual attenuation, consistent with natural damping characteristics.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900 rounded-xl p-6">
              <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">Detection Insights</h3>
              <p>
                The system is currently processing signals through multiple filtering stages including bandpass filtering,
                noise reduction, and pattern recognition algorithms. Real-time classification indicates normal operational status
                with no anomalous patterns detected in the current monitoring window.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Historical Data</h2>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {historicalDates.map((item) => (
                  <option key={item.date} value={item.date}>
                    {item.label} ({item.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Vibration Data for {selectedDate}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getHistoricalData(selectedDate)}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis
                  dataKey="time"
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amplitude"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Vibrations;
