
import React from 'react';
import { Check, Star, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const Pricing = () => {
  const plans = [
    {
      name: "30-Day Trial",
      price: "Free",
      period: "with Email Magic membership",
      description: "Perfect for testing and evaluation",
      features: [
        "Smart delay send feature",
        "Customizable delay times",
        "Basic usage analytics",
        "Email support",
        "30-day access"
      ],
      buttonText: "Get Trial License",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "60-Day Access",
      price: "Free",
      period: "with premium membership",
      description: "Extended access for active members",
      features: [
        "Everything in 30-day trial",
        "Advanced analytics dashboard",
        "Priority support",
        "Extended 60-day access",
        "Member-only features"
      ],
      buttonText: "Claim License",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Lifetime License",
      price: "Free",
      period: "for VIP members",
      description: "Permanent access with all features",
      features: [
        "Everything in 60-day access",
        "Lifetime updates",
        "VIP support channel",
        "Beta feature access",
        "Permanent license"
      ],
      buttonText: "Get VIP Access",
      buttonVariant: "outline" as const,
      popular: false
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Exclusive Access for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Email Magic Members</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            SendShield is included free with all Email Magic memberships. Non-members can purchase separately at premium pricing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500 scale-105 z-10' : ''} hover:shadow-2xl transition-all duration-300 bg-white`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="p-8 pt-0">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.buttonVariant}
                  size="lg"
                  className={`w-full py-3 font-semibold ${
                    plan.buttonVariant === 'default' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white' 
                      : 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50'
                  } transition-all duration-300`}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Non-member pricing */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Not an Email Magic Member?</h3>
              <p className="text-gray-300 mb-6">
                SendShield is available for purchase separately at premium pricing
              </p>
              <div className="flex items-center justify-center space-x-4 mb-6">
                <span className="text-3xl font-bold">$97</span>
                <span className="text-gray-400">one-time purchase</span>
              </div>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8"
              >
                Purchase License
              </Button>
              <p className="text-sm text-gray-400 mt-4">
                Or join Email Magic membership and get it free
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-gray-500">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span>30-day money-back guarantee</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-blue-500" />
            <span>Instant license delivery</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-purple-500" />
            <span>Premium support included</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
