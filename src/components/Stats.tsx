
import React from 'react';
import { Shield, Clock, Users, CheckCircle } from 'lucide-react';

const Stats = () => {
  const stats = [
    {
      icon: Shield,
      value: "500+",
      label: "Mistakes Prevented",
      description: "Average per user per month"
    },
    {
      icon: Clock,
      value: "60s",
      label: "Default Delay",
      description: "Customizable from 15s to 2min"
    },
    {
      icon: Users,
      value: "10K+",
      label: "Email Magic Members",
      description: "Trusted by professionals"
    },
    {
      icon: CheckCircle,
      value: "99.9%",
      label: "Uptime Guarantee",
      description: "Enterprise reliability"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Proven Results for Email Safety
          </h2>
          <p className="text-xl text-blue-100 leading-relaxed">
            Join thousands of professionals who've transformed their email workflow with SendShield
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-xl font-semibold text-blue-100 mb-2">
                {stat.label}
              </div>
              <div className="text-blue-200 text-sm">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-full border border-white/20">
            <Shield className="w-6 h-6" />
            <span className="font-medium text-lg">Ready to protect your emails?</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
