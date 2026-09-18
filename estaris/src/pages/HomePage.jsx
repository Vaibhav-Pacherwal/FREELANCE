import React from 'react';
import Hero from '../components/home/Hero';
import SelectedWork from '../components/home/SelectedWork';
import CapabilitiesSection from '../components/home/CapabilitiesSection';
import ArchitectureSection from '../components/home/ArchitectureSection';
import ProcessSection from '../components/home/ProcessSection';
import AboutSection from '../components/home/AboutSection';
import FinalCTA from '../components/home/FinalCTA';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <Hero />
      <SelectedWork />
      <CapabilitiesSection />
      <ArchitectureSection />
      <ProcessSection />
      <AboutSection />
      <FinalCTA />
    </div>
  );
}
