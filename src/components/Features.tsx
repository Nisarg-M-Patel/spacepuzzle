
import React from 'react';

const features = [
  {
    title: 'Feature One',
    description: 'Description of your first amazing feature goes here. Explain the benefits clearly.',
  },
  {
    title: 'Feature Two',
    description: 'Description of your second amazing feature goes here. Keep it concise and compelling.',
  },
  {
    title: 'Feature Three',
    description: 'Description of your third amazing feature goes here. Focus on the value it provides.',
  },
  {
    title: 'Feature Four',
    description: 'Description of your fourth amazing feature goes here. Tell users why it matters.',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 ">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Features</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Highlight the key features of your product or service here. Focus on the benefits that matter most to your audience.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            // Outer container creates the gradient border and shadow
            <div key={index} className="p-[2px] bg-gradient-to-t from-purple-900 to-blue-900 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {/* Inner container holds the content with a solid background */}
              <div className="bg-black p-6 rounded-md h-full">
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
