import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { ArrowRight, Activity, Wifi, WifiOff } from "lucide-react";

function Home({ darkMode }) {

  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [liveSignal, setLiveSignal] = useState(false);

  // ---------------- WebSocket + LocalStorage ----------------
  useEffect(() => {
    const stored = localStorage.getItem("synapsense_events");
    if (stored) setEvents(JSON.parse(stored));

    const ws = new WebSocket("ws://192.168.4.1:81"); // CHANGE THIS

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);

        data.timestamp = data.timestamp || new Date().toISOString();

        const updated = [...events, data];
        setEvents(updated);
        localStorage.setItem("synapsense_events", JSON.stringify(updated));
        setLiveSignal(true);

        setTimeout(() => setLiveSignal(false), 7000);
      } catch {
        console.log("Invalid ESP32 data received:", msg.data);
      }
    };

    return () => ws.close();
  }, []);

  // ---------------- Derived Analytics ----------------
  const today = new Date().toDateString();
  const todayEvents = events.filter(e => new Date(e.timestamp).toDateString() === today);

  const known = todayEvents.filter(e => e.known).length;
  const unknown = todayEvents.length - known;

  const danger = todayEvents.filter(e => e.danger).length;
  const safe = todayEvents.length - danger;

  const alarmCount = todayEvents.filter(e => e.alarm).length;

  const safePercentage = todayEvents.length ?
    Math.round((safe / todayEvents.length) * 100) : 0;

  const avgAccuracy = todayEvents.length ?
    Math.round(
      (todayEvents.reduce((sum, e) => sum + (e.accuracy || 0), 0) / todayEvents.length) * 100
    )
    : 0;

  const weights = todayEvents.filter(e => e.weight);
  const avgWeight = weights.length ?
    Math.round(weights.reduce((sum, e) => sum + e.weight, 0) / weights.length) : "--";

  // Hourly analytics
  const hourlyCount = Array(24).fill(0);
  todayEvents.forEach(e => hourlyCount[new Date(e.timestamp).getHours()]++);

  const busiestHour = hourlyCount.indexOf(Math.max(...hourlyCount)) + ":00";

  const hourlyData = hourlyCount.map((count, hour) => ({
    hour: `${hour}:00`,
    entries: count,
  }));

  // Graph dataset
  const detectionGraphData = [
    { label: "Safe", value: safe },
    { label: "Danger", value: danger },
    { label: "Known", value: known },
    { label: "Unknown", value: unknown }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition">

      <div className="max-w-7xl mx-auto px-6 py-10">


        {/* -------------------- HERO -------------------- */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-10 rounded-3xl shadow-xl mb-10">
          <div className="flex items-center gap-3">
            <Activity className="w-10 h-10" />
            <h1 className="text-4xl font-bold">SynapSense Dashboard</h1>
          </div>
          <p className="mt-3 text-white/90 text-lg max-w-2xl">
            Real-time vibration based authentication and threat classification.
          </p>

          <button
            onClick={() => navigate("/notifications")}
            className="mt-6 bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
          >
            View Notifications →
          </button>
        </div>


        {/* ---------------- LIVE STATUS ---------------- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl mb-8 flex items-center gap-3">
          {liveSignal ?
            <>
              <Wifi className="text-green-500" />
              <p className="text-green-500 font-semibold animate-pulse">Receiving live signal...</p>
            </>
            :
            <>
              <WifiOff className="text-red-500" />
              <p className="text-red-500 font-semibold">Idle — waiting for signal</p>
            </>
          }
        </div>


        {/* ---------------- LIVE ANALYSIS DASHBOARD ---------------- */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">

          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            Live Detection Dashboard
          </h2>

          {/* KPI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-center">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Total</p>
              <h3 className="text-2xl font-bold">{todayEvents.length}</h3>
            </div>

            <div className="bg-green-100 dark:bg-green-600 p-4 rounded-xl text-center">
              <p className="text-xs font-bold text-gray-800 dark:text-gray-100">Safe %</p>
              <h3 className="text-3xl font-bold">{safePercentage}%</h3>
            </div>

            <div className="bg-pink-100 dark:bg-pink-300 p-4 rounded-xl text-center">
              <p className="text-xs font-bold text-gray-800 dark:text-gray-900">Danger</p>
              <h3 className="text-3xl font-bold">{danger}</h3>
            </div>

            <div className="bg-blue-100 dark:bg-blue-600 p-4 rounded-xl text-center">
              <p className="text-xs font-bold text-gray-800 dark:text-gray-100">Accuracy</p>
              <h3 className="text-2xl font-bold">{avgAccuracy}%</h3>
            </div>

          </div>


          {/* MAIN GRAPH */}
          <ResponsiveContainer width="100%" height={330}>
            <BarChart data={detectionGraphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>


        {/* ----------------Detailed Visual Analytics ---------------- */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl mt-10">

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Detailed Activity Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="p-6 rounded-xl bg-green-100 dark:bg-green-800">
              <h3 className="font-bold text-green-900 dark:text-green-100">Busiest Time</h3>
              <p className="text-3xl font-bold mt-2 text-green-700 dark:text-green-300">{busiestHour}</p>
            </div>

            <div className="p-6 rounded-xl bg-yellow-100 dark:bg-yellow-800">
              <h3 className="font-bold text-yellow-900 dark:text-yellow-100">Alarms Triggered</h3>
              <p className="text-3xl font-bold mt-2 text-yellow-700 dark:text-yellow-300">{alarmCount}</p>
            </div>

            <div className="p-6 rounded-xl bg-blue-100 dark:bg-blue-800">
              <h3 className="font-bold text-blue-900 dark:text-blue-100">Avg Weight</h3>
              <p className="text-3xl font-bold mt-2 text-blue-700 dark:text-blue-300">{avgWeight} kg</p>
            </div>

          </div>


          {/* Hourly Chart */}
          <div className="mt-8">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="entries" fill="#10b981" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


      </div>
    </div>
  );
}

export default Home;
