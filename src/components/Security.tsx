
import React from 'react';
import { Shield, Lock, Eye, FileCheck, Users, Server } from 'lucide-react';

const Security = () => {
  const securityFeatures = [
    {
      icon: Shield,
      title: "Zero Data Storage",
      description: "We never store or access your email content. Your messages remain completely private and secure."
    },
    {
      icon: Lock,
      title: "Enterprise Compliance",
      description: "Built to pass IT security reviews in regulated industries with enterprise-grade privacy standards."
    },
    {
      icon: Eye,
      title: "No Tracking Scripts",
      description: "Zero third-party tracking or analytics. Clean, secure code without unnecessary dependencies."
    },
    {
      icon: FileCheck,
      title: "Security Audited",
      description: "Independently reviewed by third-party security firms to ensure the highest safety standards."
    },
    {
      icon: Users,
      title: "OAuth Authentication",
      description: "Secure Google OAuth integration for member verification without password storage."
    },
    {
      icon: Server,
      title: "Minimal Permissions",
      description: "Only requests the minimum Gmail permissions needed for delay functionality."
    }
  ];

  return (
    <section id="security" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-6">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Enterprise Security</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Built for Enterprise Trust
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Security-first architecture designed to meet the strictest corporate and regulatory requirements
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Security Badge Section */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Security-First Development
              </h3>
              <p className="text-gray-600">
                Every line of code follows enterprise security best practices
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Security Audited</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
                <Lock className="w-5 h-5" />
                <span className="font-semibold">Privacy Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
