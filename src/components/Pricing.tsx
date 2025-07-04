
import React from 'react';
import { Check, Shield, Clock, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const plans = [
    {
      name: "30-Day Trial",
      price: "Free",
      period: "30 days",
      description: "Perfect for trying out SendShield's core features",
      features: [
        "60-second email delay (customizable)",
        "Basic usage tracking",
        "Gmail integration",
        "Email mistake prevention",
        "Mobile-friendly design"
      ],
      popular: false,
      cta: "Start Free Trial"
    },
    {
      name: "Email Magic Member",
      price: "Included",
      period: "with membership",
      description: "Full access included with your Email Magic membership",
      features: [
        "All trial features",
        "Unlimited usage",
        "Priority support",
        "Future feature updates",
        "Member-only bonuses",
        "Extended customization"
      ],
      popular: true,
      cta: "Access Now"
    },
    {
      name: "Standalone License",
      price: "$297",
      period: "lifetime",
      description: "Full access without Email Magic membership",
      features: [
        "All premium features",
        "Lifetime updates",
        "Priority support",
        "Advanced analytics",
        "Custom delay settings",
        "Enterprise features"
      ],
      popular: false,
      cta: "Buy License"
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Access Level
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Flexible options designed for individuals and Email Magic members
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
              plan.popular 
                ? 'border-purple-500 bg-gradient-to-b from-purple-50 to-white' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-600 ml-2">/ {plan.period}</span>
                  )}
                </div>
                <p className="text-gray-600">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular ? 'bg-purple-500' : 'bg-blue-500'
                    }`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>Instant access</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-purple-500" />
              <span>No hidden fees</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
