import React from 'react';

const Home = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            The Windy City: A City of Superlatives
          </h1>
          
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Welcome to Chicago, a true American metropolis nestled on the shores of the vast Lake Michigan.
            Known as the birthplace of the modern skyscraper, its skyline is a breathtaking testament to
            architectural ambition and innovation. But Chicago is far more than just steel and glass. It's a city
            with a soul, pulsating with the raw energy of live blues music, the intellectual wit of legendary
            comedy clubs, and the roar of passionate sports fans.
          </p>

          <p className="text-lg text-gray-700 mb-12 leading-relaxed">
            Venture beyond the downtown Loop to discover a city of vibrant, distinct neighborhoods. From
            the trendy boutiques of Wicker Park to the historic brownstones of Lincoln Park, each area offers a
            unique flavor and charm. Explore world-class institutions like the Art Institute, stroll along the
            scenic Lakefront Trail, or marvel at the city's beauty from a river cruise. And of course, there's the
            food—while the deep-dish pizza is a must-try, the city's culinary scene boasts everything from
            Michelin-starred dining to diverse, multicultural street food.
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              About Chi-Go: Your Smart Trip Planner
            </h2>
            
            <p className="text-gray-700 mb-6">
              Planning a trip to a city as rich as Chicago can be overwhelming. Which sights are "can't miss"?
              Which restaurants are truly worth it? How do you organize it all? Chi-Go was built to eliminate that
              hassle and empower you to craft your perfect Chicago adventure with ease and confidence.
            </p>

            <p className="text-gray-700 mb-8">
              Our philosophy is simple: provide you with the best tools to discover, visualize, and plan. We've
              curated lists of the most iconic attractions and celebrated restaurants so you can spend less time
              researching and more time dreaming. Use our interactive map to see where everything is located,
              helping you group activities by neighborhood and plan your days efficiently. Finally, build your
              personalized itinerary by adding items to your personal checklist—your custom-made guide to the
              city.
            </p>

            <button
              onClick={() => setCurrentPage('attractions')}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              Start Exploring
            </button>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Helpful Links</h3>
            <div className="space-y-2">
              <a href="https://www.transitchicago.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 block">
                CTA - Public Transit
              </a>
              <a href="https://www.choosechicago.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 block">
                Official Chicago Tourism Site
              </a>
              <a href="https://www.chicago.gov/city/en/depts/dca/supp_info/chicago_events.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 block">
                City of Chicago Events
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;