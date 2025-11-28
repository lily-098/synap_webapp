import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

function FAQs({ darkMode }) {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What is SynapSense and how does it work?',
      answer: 'SynapSense is an advanced vibration-based detection system that uses seismic sensors to monitor ground vibrations. The system analyzes these vibrations using sophisticated signal processing algorithms, including Fast Fourier Transform (FFT) analysis, to differentiate between various sources such as animals, humans, and environmental noise. Real-time data is processed through machine learning models to provide accurate classification and immediate alerts.',
    },
    {
      question: 'How accurate is the detection system?',
      answer: 'SynapSense maintains a detection accuracy of 98.7% under normal operating conditions. The system uses multiple validation techniques including pattern recognition, frequency analysis, and amplitude threshold detection. Continuous machine learning improvements and regular calibration ensure consistent high accuracy across different environmental conditions and scenarios.',
    },
    {
      question: 'What types of threats can SynapSense detect?',
      answer: 'The system can detect and classify multiple types of vibration sources including human footsteps, animal movements, vehicle activity, machinery vibrations, and environmental noise. It distinguishes between authorized and unauthorized movements, identifies patterns consistent with security threats, and filters out false positives from natural phenomena like wind or rain.',
    },
    {
      question: 'How is the vibration data analyzed in real-time?',
      answer: 'Vibration data is continuously sampled at high frequencies and processed through a multi-stage pipeline. Raw signals undergo noise filtering, amplitude normalization, and frequency domain transformation using FFT. The processed data is then compared against known signature patterns stored in the database. Advanced algorithms identify anomalies and classify events within milliseconds of detection.',
    },
    {
      question: 'Can I customize alert thresholds and notification settings?',
      answer: 'Yes, SynapSense offers comprehensive customization options. Users can set custom sensitivity levels for different zones, configure alert thresholds based on amplitude or frequency characteristics, schedule monitoring periods, and choose notification methods including in-app alerts, email notifications, and SMS messages. Settings can be adjusted through the system dashboard.',
    },
    {
      question: 'How far back can I access historical vibration data?',
      answer: 'The system stores all vibration data with full waveform retention for 30 days and summary statistics for up to 12 months. Users can access historical graphs, replay past events, generate reports, and export data for external analysis. Cloud backup ensures data integrity and availability for compliance and forensic purposes.',
    },
    {
      question: 'What maintenance does the system require?',
      answer: 'SynapSense requires minimal maintenance due to its robust design. Sensors should be calibrated every 6 months to maintain accuracy. The system performs automated health checks daily and alerts administrators if any issues are detected. Software updates are applied automatically, and sensor batteries (for wireless units) typically last 2-3 years under normal usage.',
    },
    {
      question: 'Is the system weather-resistant and suitable for outdoor use?',
      answer: 'Yes, all SynapSense sensors are designed with IP67 or higher ratings, making them fully weather-resistant and suitable for outdoor deployment. They can operate in temperature ranges from -40°C to +85°C and are protected against dust, rain, snow, and extreme humidity. The system includes temperature compensation algorithms to maintain accuracy across varying environmental conditions.',
    },
    {
      question: 'How does SynapSense handle false alarms?',
      answer: 'The system employs multiple layers of false alarm reduction including adaptive threshold adjustment, pattern verification, temporal correlation analysis, and machine learning-based classification. Environmental conditions are continuously monitored and factored into detection algorithms. Users can also define exclusion zones and time-based filtering to further reduce false positives.',
    },
    {
      question: 'Can multiple zones be monitored simultaneously?',
      answer: 'Absolutely. SynapSense supports multi-zone monitoring with independent sensor arrays for each zone. The system can handle up to 50 zones simultaneously with individual configuration settings, alert rules, and sensitivity levels for each area. A centralized dashboard provides a unified view of all zones with the ability to drill down into specific area details.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-2xl p-8 md:p-12 mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <HelpCircle className="w-12 h-12 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Frequently Asked Questions</h1>
          </div>
          <p className="text-white text-lg">
            Find answers to common questions about SynapSense, its capabilities, and how it can help secure your environment.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-5 pt-2">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-8 transition-colors duration-300">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Still have questions?</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Our support team is available 24/7 to help you with any questions or concerns about SynapSense.
            We're committed to ensuring you get the most out of our vibration detection system.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
              Contact Support
            </button>
            <button className="px-6 py-3 bg-white dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors shadow-lg hover:shadow-xl">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQs;
