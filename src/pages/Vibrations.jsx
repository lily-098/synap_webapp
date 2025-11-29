import { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  Activity,
  PlugZap,
  Play,
  Cpu,
  Database,
  BrainCircuit,
} from "lucide-react";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

function Vibrations() {
  const [personName, setPersonName] = useState("");
  const [liveData, setLiveData] = useState([]);
  const [recordBuffer, setRecordBuffer] = useState([]);
  const [status, setStatus] = useState("Idle...");
  const [prediction, setPrediction] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const portRef = useRef(null);
  const readerRef = useRef(null);
  const stopRef = useRef(false);
  const alarmRef = useRef(null);

  // ------------------------ SERIAL SUPPORT CHECK ------------------------
  useEffect(() => {
    if (!("serial" in navigator)) {
      alert("⚠ Web Serial API NOT supported. Use Chrome/Edge desktop.");
    }
  }, []);

  // ------------------------ CLEANUP ON EXIT ------------------------
  useEffect(() => {
    return () => {
      stopRef.current = true;
      readerRef.current?.cancel().catch(() => {});
      portRef.current?.close().catch(() => {});
    };
  }, []);

  // ------------------------ CONNECT SERIAL ------------------------
  const connectSerial = async () => {
    if (!personName.trim()) return setStatus("⚠ Enter name first.");

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      const decoder = new TextDecoderStream();
      port.readable.pipeTo(decoder.writable);
      const reader = decoder.readable.getReader();

      portRef.current = port;
      readerRef.current = reader;
      stopRef.current = false;

      setIsConnected(true);
      setLiveData([]);
      setRecordBuffer([]);
      setStatus("🟢 Connected. Receiving live data...");

      readLoop(reader);
    } catch {
      setStatus("❌ Failed to connect to port.");
    }
  };

  // ------------------------ SERIAL READ LOOP ------------------------
  const readLoop = async (reader) => {
    while (!stopRef.current) {
      const { value, done } = await reader.read();
      if (done || !value) break;

      value.split("\n").forEach((line) => {
        const amp = parseFloat(line.trim());
        if (isNaN(amp)) return;

        const t = performance.now() / 1000;

        setLiveData((prev) => [...prev.slice(-300), { time: t, amplitude: amp }]);
        setRecordBuffer((prev) => [...prev, { time: t, amplitude: amp }]);
      });
    }
  };

  // ------------------------ DISCONNECT SERIAL ------------------------
  const disconnectSerial = async () => {
    stopRef.current = true;
    await readerRef.current?.cancel().catch(() => {});
    await portRef.current?.close().catch(() => {});
    setIsConnected(false);
    setStatus("🔌 Disconnected.");
  };

  // ------------------------ FORMAT INTO 200 SAMPLE CHUNKS ------------------------
  const prepareChunks = () => {
    const chunkSize = 200;
    const chunks = [];
    for (let i = 0; i < recordBuffer.length; i += chunkSize) {
      chunks.push(recordBuffer.slice(i, i + chunkSize).map((d) => d.amplitude));
    }
    return chunks;
  };

  // ------------------------ 1️⃣ SAVE TRAINING DATA ------------------------
  const handleSaveTrainData = async () => {
    if (!personName.trim()) return setStatus("⚠ Enter name first.");
    if (recordBuffer.length < 200)
      return setStatus("⚠ Need at least 200 samples before saving.");

    const chunks = prepareChunks();

    setStatus("⬆ Uploading training data...");

    const res = await fetch("/train_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: chunks,
        label: personName.trim(),
      }),
    });

    const result = await res.json();
    setStatus(`📁 Training saved (${result.count || chunks.length} chunks stored).`);
  };

  // ------------------------ 2️⃣ TRAIN MODEL ------------------------
  const handleTrainModel = async () => {
    setStatus("🤖 Training model...");

    const res = await fetch("/train_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [],
        label: personName.trim(),
        train_model: true,
      }),
    });

    const result = await res.json();
    setStatus(`🎯 Model trained successfully: ${result.message || "OK"}`);
  };

  // ------------------------ 3️⃣ PREDICT ------------------------
  const handlePredict = async () => {
    if (recordBuffer.length < 200)
      return setStatus("⚠ Need at least 200 samples to predict.");

    const lastChunk = recordBuffer.slice(-200).map((d) => d.amplitude);

    setStatus("🔍 Predicting identity...");

    const res = await fetch("/predictfootsteps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: lastChunk }),
    });

    const result = await res.json();
    setPrediction(result);

    if (!result.match) {
      alarmRef.current.currentTime = 0;
      alarmRef.current.play();
    }

    setStatus(result.match ? `✔ MATCHED: ${result.label}` : "🚨 INTRUDER DETECTED!");
  };

  // ------------------------ GRAPH SETUP ------------------------
  const liveChartData = {
    labels: liveData.map((d) => d.time.toFixed(1)),
    datasets: [
      {
        label: "Vibration Waveform",
        data: liveData.map((d) => d.amplitude),
        borderColor: "#00eaff",
        backgroundColor: "rgba(0,234,255,0.2)",
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold flex gap-2 items-center mb-6">
        <Activity /> Vibration Identity Recognition System
      </h1>

      {/* NAME INPUT */}
      <input
        value={personName}
        onChange={(e) => setPersonName(e.target.value)}
        placeholder="Enter Person Name"
        className="text-black p-3 rounded-lg mb-4 w-64"
      />

      {/* BUTTONS */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={isConnected ? disconnectSerial : connectSerial}
          className="bg-blue-600 text-white px-5 py-3 rounded-xl flex gap-2 items-center"
        >
          <PlugZap />
          {isConnected ? "Disconnect" : "Connect"}
        </button>

        <button
          onClick={handleSaveTrainData}
          className="bg-green-600 text-white px-5 py-3 rounded-xl flex gap-2 items-center"
        >
          <Database /> Save Train Data
        </button>

        <button
          onClick={handleTrainModel}
          className="bg-yellow-600 text-white px-5 py-3 rounded-xl flex gap-2 items-center"
        >
          <BrainCircuit /> Train Model
        </button>

        <button
          onClick={handlePredict}
          className="bg-purple-600 text-white px-5 py-3 rounded-xl flex gap-2 items-center"
        >
          <Play /> Predict
        </button>
      </div>

      {/* STATUS */}
      <p className="text-lg flex gap-2 items-center mb-4">
        <Cpu className="w-5" /> {status}
      </p>

      {/* LIVE GRAPH */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <Line data={liveChartData} height={120} />
      </div>

      <audio ref={alarmRef} src="/alarm.mp3" preload="auto" />
    </div>
  );
}

export default Vibrations;
