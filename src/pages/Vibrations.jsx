import { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, BarController, BarElement } from "chart.js";
import { Activity, Calendar } from "lucide-react";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, BarController, BarElement);

function Vibrations({ darkMode }) {
  const [selectedDate, setSelectedDate] = useState("live");
  const [liveData, setLiveData] = useState([]);
  const websocketRef = useRef(null);

  const FFT_LENGTH = 30;
  const [fftData, setFftData] = useState(Array(FFT_LENGTH).fill({ frequency: 0, magnitude: 0 }));

  // --- WebSocket Setup (LIVE DATA FROM ESP32/WIFI) ---
  useEffect(() => {
    websocketRef.current = new WebSocket("ws://192.168.4.1:81/"); // CHANGE TO YOUR ESP WS PORT

    websocketRef.current.onmessage = (message) => {
      try {
        let parsed = JSON.parse(message.data);

        // Store waveform values
        setLiveData(prev => [...prev.slice(-200), parsed]);

        // Update FFT based on incoming magnitude
        setFftData(prev =>
          [...prev.slice(1), { frequency: parsed.frequency ?? prev.length, magnitude: parsed.fft ?? 0 }]
        );
      } catch {
        console.warn("Invalid data format:", message.data);
      }
    };

    websocketRef.current.onerror = () => console.error("WebSocket error");
    websocketRef.current.onclose = () => console.warn("WebSocket disconnected");

    return () => websocketRef.current?.close();
  }, []);

  // --- Chart Config for Live Signal ---
  const lineChartData = {
    labels: liveData.map((d) => d.time.toFixed(2)),
    datasets: [
      {
        label: "Vibration Amplitude",
        data: liveData.map((d) => d.amplitude),
        borderColor: "#06b6d4",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  // --- FFT Chart ---
  const fftChartData = {
    labels: fftData.map((d) => d.frequency),
    datasets: [
      {
        label: "Magnitude",
        data: fftData.map((d) => d.magnitude),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex items-center gap-4 mb-3">
            <Activity className="w-12 h-12 text-white" />
            <h1 className="text-4xl font-bold text-white">
              Real-Time Vibration Monitoring
            </h1>
          </div>
          <p className="text-white opacity-80">
            Live sensor data streamed from ESP32 over Wi-Fi and visualized using FFT
            and waveform analysis.
          </p>
        </div>

        {/* LIVE WAVEFORM */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Live Signal Waveform</h2>
          <Line data={lineChartData} height={100} />
        </div>

        {/* FFT */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">FFT Frequency Analysis</h2>
          <Line data={fftChartData} height={100} />
        </div>

        {/* FUTURE: HISTORICAL DATA UI (not yet connected until DB exists) */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">History</h2>
            <div className="flex gap-2 items-center">
              <Calendar className="w-5 text-gray-500" />
              <select
                className="border px-3 py-2 rounded-lg"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="live">Live</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
              </select>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Historical storage will activate once database is connected.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Vibrations;
