
import React from 'react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-6xl font-bold leading-normal py-3 mb-6 bg-gradient-to-br from-blue-500 to-fuchsia-500 bg-clip-text text-transparent">
          Build something amazing
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          This clean, blank canvas is ready for you to add your vision. Start creating your next great project today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="px-8 rounded-md bg-gradient-to-br from-blue-700 to-blue-900 text-white hover:from-blue-600 hover:to-fuchsia-600 transition-colors">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="px-8 rounded-md">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
