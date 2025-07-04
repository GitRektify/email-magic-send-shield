
import React from 'react';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Security from '@/components/Security';
import Stats from '@/components/Stats';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Stats />
      <Security />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
