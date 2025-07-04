
import React from 'react';
import { Shield, Clock, Users, Zap, Lock, BarChart3 } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Clock,
      title: "Smart Delay Technology",
      description: "Automatically delays emails for 60 seconds (customizable 15s-2min) giving you time to prevent mistakes before they happen.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Zero email content storage. Complete privacy with enterprise-grade security that passes IT reviews in regulated industries.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Premium Member Access",
      description: "Exclusive access control through Google OAuth with flexible license management and membership integration.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Seamless Integration",
      description: "Works natively with Gmail's interface. No workflow disruption, just enhanced email safety and peace of mind.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "No third-party tracking, no data transmission. Your emails stay private while we keep you safe from sending mistakes.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: BarChart3,
      title: "Usage Analytics",
      description: "Track prevented mistakes with anonymous stats. See how many regrettable emails you've avoided sending.",
      gradient: "from-teal-500 to-blue-500"
    }
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for Email Safety
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Everything you need to prevent email mistakes and maintain professional communication standards
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
