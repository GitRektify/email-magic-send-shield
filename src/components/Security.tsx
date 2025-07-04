
import React from 'react';
import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const Security = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: "Zero Data Storage",
      description: "Your email content never leaves your device. We don't store, transmit, or access any of your email data."
    },
    {
      icon: Eye,
      title: "Privacy First",
      description: "No tracking scripts, no third-party dependencies. Only essential Gmail API calls for core functionality."
    },
    {
      icon: Shield,
      title: "Enterprise Grade",
      description: "Built to pass IT security reviews in regulated industries. Full compliance documentation included."
    },
    {
      icon: CheckCircle,
      title: "Audit Ready",
      description: "Third-party security review planned. Clean, auditable codebase designed for enterprise scrutiny."
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <Shield className="w-16 h-16 text-blue-400" />
              <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Enterprise-Grade
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Security</span>
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            Built for corporations, trusted by professionals. Your data security is our highest priority.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security Badges */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Trusted by Enterprise IT Teams</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-400">0</div>
                <div className="text-gray-300 text-sm">Email Content Stored</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-400">100%</div>
                <div className="text-gray-300 text-sm">Local Processing</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-400">GDPR</div>
                <div className="text-gray-300 text-sm">Compliant</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-cyan-400">SOC 2</div>
                <div className="text-gray-300 text-sm">Ready</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Promise */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-3 bg-green-500/20 text-green-400 px-6 py-3 rounded-full border border-green-500/30">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Third-party security audit scheduled</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
