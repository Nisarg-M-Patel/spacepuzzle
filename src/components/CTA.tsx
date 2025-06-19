
import React from 'react';
import { Button } from '@/components/ui/button';

const CTA = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Join thousands of satisfied customers already using our product to improve their business.
        </p>
        <Button size="lg" className="px-8 rounded-md bg-gradient-to-br from-blue-700 to-blue-900 text-white hover:from-blue-600 hover:to-fuchsia-600 transition-colors">
          Sign Up Now
        </Button>
      </div>
    </section>
  );
};

export default CTA;
