
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Shield, Mail, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Demo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [countdown, setCountdown] = useState(60);
  const [emailStatus, setEmailStatus] = useState('composing'); // composing, delayed, sent, cancelled

  const demoSteps = [
    { title: "Compose Your Email", description: "Write your email as usual in Gmail" },
    { title: "Click Send", description: "Hit the send button like you normally would" },
    { title: "SendShield Activates", description: "Email is automatically delayed for 60 seconds" },
    { title: "Review & Edit Window", description: "You have time to cancel or make changes" },
    { title: "Email Sent Safely", description: "After the delay, email sends automatically" }
  ];

  useEffect(() => {
    let timer;
    if (isPlaying && step === 2 && countdown > 0 && emailStatus === 'delayed') {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setEmailStatus('sent');
            setStep(4);
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 50); // Faster for demo purposes
    }
    return () => clearInterval(timer);
  }, [isPlaying, step, countdown, emailStatus]);

  const startDemo = () => {
    setIsPlaying(true);
    setStep(0);
    setCountdown(60);
    setEmailStatus('composing');
    
    // Simulate demo progression
    const progression = [
      () => { setStep(1); setEmailStatus('composing'); },
      () => { setStep(2); setEmailStatus('delayed'); },
      () => { /* countdown handled by useEffect */ },
    ];

    progression.forEach((action, index) => {
      setTimeout(action, (index + 1) * 1500);
    });
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setStep(0);
    setCountdown(60);
    setEmailStatus('composing');
  };

  const cancelEmail = () => {
    setEmailStatus('cancelled');
    setIsPlaying(false);
    setStep(3);
  };

  return (
    <section id="demo" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            See SendShield in Action
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Watch how SendShield automatically protects you from email mistakes with our smart delay technology
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Demo */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Live Demo</h3>
              <div className="flex gap-3">
                <Button
                  onClick={startDemo}
                  disabled={isPlaying}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isPlaying ? 'Playing...' : 'Start Demo'}
                </Button>
                <Button variant="outline" onClick={resetDemo}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Gmail Mockup */}
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-600 font-medium">Gmail</span>
              </div>

              {/* Email Compose Window */}
              <div className="bg-white rounded-lg border border-gray-300 p-4 mb-4">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-12">To:</span>
                    <span className="text-gray-700">client@company.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-12">Subject:</span>
                    <span className="text-gray-700">Important Project Update</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700 mb-4">
                  Hi there,<br/><br/>
                  I wanted to update you on the project progress...
                  <span className={`inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse ${emailStatus !== 'composing' ? 'hidden' : ''}`}></span>
                </div>

                {/* Send Button Area */}
                <div className="flex items-center justify-between">
                  <Button 
                    className={`bg-blue-600 hover:bg-blue-700 text-sm ${step >= 1 ? 'opacity-50' : ''}`}
                    disabled={step >= 1}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send
                  </Button>

                  {/* SendShield Notification */}
                  {emailStatus === 'delayed' && (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-3 animate-fade-in">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">SendShield</span>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono text-sm">{countdown}s</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/20 text-xs px-2 py-1"
                        onClick={cancelEmail}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {/* Success State */}
                  {emailStatus === 'sent' && (
                    <div className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 animate-fade-in">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Email Sent</span>
                    </div>
                  )}

                  {/* Cancelled State */}
                  {emailStatus === 'cancelled' && (
                    <div className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 animate-fade-in">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Email Cancelled - Crisis Averted!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-600">Demo Progress</span>
                <span className="text-sm text-gray-500">Step {step + 1} of {demoSteps.length}</span>
              </div>
              <div className="space-y-2">
                {demoSteps.map((stepItem, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      index === step
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : index < step
                        ? 'bg-green-50 border-l-4 border-green-500'
                        : 'bg-gray-50 border-l-4 border-gray-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === step
                        ? 'bg-blue-500 text-white'
                        : index < step
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index < step ? '✓' : index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{stepItem.title}</div>
                      <div className="text-sm text-gray-600">{stepItem.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Prevents Costly Mistakes</h4>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Automatically gives you a 60-second window to catch typos, wrong recipients, 
                missing attachments, or emotional responses before they leave your inbox.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Customizable Timing</h4>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Choose your perfect delay time: 15 seconds for quick emails, 
                60 seconds for important messages, or up to 2 minutes for critical communications.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Zero Workflow Disruption</h4>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Works seamlessly with Gmail's existing interface. No learning curve, 
                no new buttons to remember - just enhanced safety for your existing workflow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;
