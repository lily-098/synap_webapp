import { Activity, Shield, Zap, Target, Users, Award } from 'lucide-react';

function About({ darkMode }) {
  const features = [
    {
      icon: Activity,
      title: 'Advanced Signal Processing',
      description: 'State-of-the-art algorithms analyze vibration patterns in real-time using FFT and machine learning techniques.',
    },
    {
      icon: Shield,
      title: 'Enhanced Security',
      description: 'Proactive threat detection and classification provides comprehensive perimeter security and intrusion prevention.',
    },
    {
      icon: Zap,
      title: 'Real-Time Response',
      description: 'Millisecond-level detection and instant notifications ensure rapid response to potential security events.',
    },
    {
      icon: Target,
      title: 'Precision Detection',
      description: '98.7% accuracy rate with minimal false alarms through adaptive filtering and pattern recognition.',
    },
    {
      icon: Users,
      title: 'Multi-Zone Coverage',
      description: 'Monitor multiple areas simultaneously with independent configurations and centralized management.',
    },
    {
      icon: Award,
      title: 'Industry Leading',
      description: 'Trusted by security professionals worldwide for critical infrastructure and perimeter protection.',
    },
  ];

  const benefits = [
    {
      title: 'Military & Defense',
      description: 'Perimeter security for bases, forward operating positions, and critical defense installations.',
    },
    {
      title: 'Critical Infrastructure',
      description: 'Protection of power plants, water facilities, telecommunications, and transportation hubs.',
    },
    {
      title: 'Commercial Properties',
      description: 'Security for warehouses, data centers, manufacturing facilities, and corporate campuses.',
    },
    {
      title: 'Residential Security',
      description: 'Advanced protection for high-value residential properties and gated communities.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-2xl p-8 md:p-12 mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-12 h-12 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">About SynapSense</h1>
          </div>
          <p className="text-white text-xl leading-relaxed">
            Revolutionizing security through intelligent vibration detection and analysis.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 mb-12 transition-colors duration-300">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">What is SynapSense?</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            <p>
              SynapSense is a cutting-edge vibration-based detection and monitoring system that uses advanced seismic sensor technology
              to provide comprehensive security and surveillance capabilities. By analyzing ground vibrations with military-grade precision,
              our system can detect, classify, and alert you to various types of movement and activity in real-time.
            </p>
            <p>
              Unlike traditional security systems that rely solely on visual surveillance, SynapSense operates 24/7 in all weather conditions,
              detecting threats that cameras might miss. The system processes thousands of data points per second, using sophisticated
              algorithms to distinguish between harmless environmental noise and genuine security concerns.
            </p>
            <p>
              Built on years of research in signal processing, machine learning, and seismic analysis, SynapSense represents the
              next generation of perimeter security. Our technology has been proven in the most demanding environments, providing
              reliable protection for critical infrastructure, military installations, and high-value assets worldwide.
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">Core Capabilities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl p-8 md:p-12 mb-12 transition-colors duration-300">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Our Purpose</h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
            At SynapSense, our mission is to provide the most advanced, reliable, and intelligent vibration detection technology
            to protect what matters most. We believe that security should be proactive, not reactive. By detecting threats before
            they materialize and providing actionable intelligence in real-time, we empower our clients to maintain safe, secure
            environments for their people, assets, and operations.
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            Our commitment extends beyond technology. We partner with our clients to understand their unique security challenges
            and deliver customized solutions that integrate seamlessly with existing security infrastructure. Through continuous
            innovation and unwavering dedication to quality, we're setting new standards for perimeter security worldwide.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">Who Benefits from SynapSense?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow"
              >
                <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">{benefit.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 text-lg">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 transition-colors duration-300">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">The Technology Behind SynapSense</h2>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Seismic Sensor Array</h3>
              <p className="text-gray-700 dark:text-gray-300">
                High-sensitivity geophone sensors detect micro-vibrations in the ground, capturing movement with unprecedented accuracy.
                Multiple sensors work in concert to provide directional information and eliminate false positives.
              </p>
            </div>

            <div className="border-l-4 border-cyan-600 pl-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Signal Processing Engine</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Advanced digital signal processing algorithms filter noise, extract relevant features, and transform raw sensor data
                into meaningful intelligence. FFT analysis reveals frequency domain characteristics unique to different threat types.
              </p>
            </div>

            <div className="border-l-4 border-blue-600 pl-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Machine Learning Classification</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Neural network models trained on millions of vibration signatures enable accurate classification of detected events.
                The system continuously learns and adapts to environmental changes, improving accuracy over time.
              </p>
            </div>

            <div className="border-l-4 border-cyan-600 pl-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Cloud-Connected Intelligence</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Secure cloud connectivity enables remote monitoring, historical data analysis, and system management from anywhere.
                Automated updates ensure your system always has the latest detection algorithms and security features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
