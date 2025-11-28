import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Vibrations from './pages/Vibrations';
import Notifications from './pages/Notifications';
import FAQs from './pages/FAQs';
import About from './pages/About';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            setSidebarOpen={setSidebarOpen}
          />
          <Sidebar
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            darkMode={darkMode}
          />
          <Routes>
            <Route path="/" element={<Home darkMode={darkMode} />} />
            <Route path="/vibrations" element={<Vibrations darkMode={darkMode} />} />
            <Route path="/notifications" element={<Notifications darkMode={darkMode} />} />
            <Route path="/faqs" element={<FAQs darkMode={darkMode} />} />
            <Route path="/about" element={<About darkMode={darkMode} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
