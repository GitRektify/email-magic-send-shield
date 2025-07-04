
import React from 'react';
import { Shield, Clock, Settings, BarChart3 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Clock,
      title: "Smart Delay Send",
      description: "Automatically intercepts and delays emails for 60 seconds (or your custom time), giving you a safety net against rushed mistakes.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Zero email content storage. Enterprise-grade privacy with full IT compliance for regulated industries.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Settings,
      title: "Customizable Delays",
      description: "Set your perfect delay time: 15s, 30s, 60s, or 2 minutes. Tailor the protection to match your workflow.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Impact Tracking",
      description: "See how many mistakes you've prevented. Track your email safety improvements with detailed analytics.",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Email Safety</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Built with enterprise-grade security and designed for professionals who value precision in their communication.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm"
            >
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Visual Demo Section */}
        <div className="mt-24 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">See It In Action</h3>
            <p className="text-lg text-gray-600">Watch how SendShield seamlessly protects your Gmail workflow</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1 rounded-2xl">
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="bg-gray-100 px-6 py-4 flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>  
                </div>
                <span className="text-gray-600 text-sm font-medium">Gmail - Compose</span>
              </div>
              
              <div className="p-8">
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="text-sm text-gray-500 mb-2">To: client@company.com</div>
                  <div className="text-sm text-gray-500 mb-4">Subject: Quarterly Report Update</div>
                  <div className="text-gray-700 leading-relaxed">
                    Hi Sarah,<br/><br/>
                    I've attached the quarterly report for your review...<br/><br/>
                    Best regards,<br/>
                    Alex
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="font-semibold text-blue-900">SendShield Active</div>
                      <div className="text-sm text-blue-700">Email will send in 45 seconds</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                      Edit
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      Send Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
