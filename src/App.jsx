import React, { useState, useEffect, useRef } from 'react';
import WeeklyChart from './components/WeeklyChart';
import './App.css';

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyD_RxGFjYwvqoDIq17ZMhdLcChy0tTTrnU';

function App() {
  const [locations, setLocations] = useState({
    home: 'Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо',
    school: 'Улаанбаатар хот, Баянзүрх дүүрэг, 15-р хороо',
    work: 'Улаанбаатар хот, Чингэлтэй дүүрэг, Төв хэсэг'
  });
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const autocompletesRef = useRef({});

  // Load Google Maps API
  useEffect(() => {
    if (window.google) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=mn`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      setError('Google Maps API ачаалахад алдаа гарлаа');
    };
    document.head.appendChild(script);
  }, []);

  // Initialize map and autocomplete
  useEffect(() => {
    if (mapLoaded && mapRef.current && window.google) {
      try {
        // Initialize map
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 47.9184, lng: 106.9177 }, // Ulaanbaatar center
          zoom: 12,
          language: 'mn'
        });

        // Initialize directions service and renderer
        directionsServiceRef.current = new window.google.maps.DirectionsService();
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          draggable: true,
          panel: null
        });
        directionsRendererRef.current.setMap(mapInstanceRef.current);

        // Initialize autocomplete for each input
        const inputs = ['home', 'school', 'work'];
        inputs.forEach(inputType => {
          const input = document.getElementById(`${inputType}-input`);
          if (input) {
            const autocomplete = new window.google.maps.places.Autocomplete(input, {
              componentRestrictions: { country: 'mn' },
              fields: ['place_id', 'geometry', 'name', 'formatted_address'],
              language: 'mn'
            });

            autocomplete.addListener('place_changed', () => {
              const place = autocomplete.getPlace();
              if (place.formatted_address) {
                setLocations(prev => ({
                  ...prev,
                  [inputType]: place.formatted_address
                }));
              }
            });

            autocompletesRef.current[inputType] = autocomplete;
          }
        });
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        setError('Google Maps тохиргоо хийхэд алдаа гарлаа');
      }
    }
  }, [mapLoaded]);

  const handleInputChange = (field, value) => {
    setLocations(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateRoute = async () => {
    if (!locations.home || !locations.school || !locations.work) {
      alert('Бүх байршлыг оруулна уу');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Calculate travel times via API
      const response = await fetch('/api/calculate-travel-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locations),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const travelData = await response.json();
      
      if (travelData.success) {
        // Calculate time loss
        const timeLossResponse = await fetch('/api/calculate-time-loss', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ travel_times: travelData.travel_times }),
        });

        if (!timeLossResponse.ok) {
          throw new Error(`HTTP error! status: ${timeLossResponse.status}`);
        }

        const timeLossData = await timeLossResponse.json();
        
        if (timeLossData.success) {
          setResults({
            travelTimes: travelData.travel_times,
            timeLoss: timeLossData.time_loss
          });

          // Display route on map if Google Maps is loaded
          if (mapInstanceRef.current && directionsServiceRef.current && window.google) {
            displayRoute();
          }
        } else {
          throw new Error(timeLossData.error || 'Цаг алдалт тооцоолохд алдаа гарлаа');
        }
      } else {
        throw new Error(travelData.error || 'Зорчих цаг тооцоолохд алдаа гарлаа');
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      setError('Тооцоолол хийхэд алдаа гарлаа: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const displayRoute = () => {
    if (!directionsServiceRef.current || !directionsRendererRef.current || !window.google) return;

    try {
      // Create waypoints for the Mongolian family pattern: Home -> School -> Work -> Home
      const waypoints = [
        { location: locations.school, stopover: true },
        { location: locations.work, stopover: true }
      ];

      const request = {
        origin: locations.home,
        destination: locations.home,
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        language: 'mn'
      };

      directionsServiceRef.current.route(request, (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      });
    } catch (error) {
      console.error('Error displaying route:', error);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} мин`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            Тугжрэлд Алдагдсан Цаг Тооцоолуур
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Өдөр бүр тугжрэлд хэр их цаг алдаж байгаагаа олж мэдээд, 
            жилийн хэмжээнд хэр их болож алдаж байгаагаа харна уу
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Input form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Өдрийн маршрутаа оруулна уу</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Гэрийн хаяг
                </label>
                <input
                  id="home-input"
                  type="text"
                  value={locations.home}
                  onChange={(e) => handleInputChange('home', e.target.value)}
                  placeholder="Гэрийн хаягаа оруулна уу"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сургууль/Их сургууль
                </label>
                <input
                  id="school-input"
                  type="text"
                  value={locations.school}
                  onChange={(e) => handleInputChange('school', e.target.value)}
                  placeholder="Сургуулийн хаягаа оруулна уу"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ажлын байр
                </label>
                <input
                  id="work-input"
                  type="text"
                  value={locations.work}
                  onChange={(e) => handleInputChange('work', e.target.value)}
                  placeholder="Ажлын байрны хаягаа оруулна уу"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={calculateRoute}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '⏳ Тооцоолж байна...' : '📊 Цагийн алдагдлыг тооцоолох'}
              </button>
            </div>
          </div>

          {/* Right side - Map */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Таны маршрутын дүрслэл</h2>
            <div 
              ref={mapRef}
              className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center"
            >
              {!mapLoaded && (
                <div className="text-center">
                  <div className="text-gray-500 mb-2">🗺️</div>
                  <p className="text-gray-500">Google Map ачаалж байна...</p>
                  <p className="text-sm text-gray-400">API key тохируулсны дараа</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results section */}
        {results && (
          <div className="mt-8">
            <h2 className="text-3xl font-bold text-center mb-8">Таны цаг алдалтын дүн</h2>
            
            {/* Daily route breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-blue-600">🏠</span>
                  <span className="mx-2">→</span>
                  <span className="text-yellow-600">🏫</span>
                  <span className="ml-2 text-sm font-medium">Гэр → Сургууль</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatDuration(results.travelTimes.home_to_school?.duration_value || 1500)}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-600">🏫</span>
                  <span className="mx-2">→</span>
                  <span className="text-green-600">🏢</span>
                  <span className="ml-2 text-sm font-medium">Сургууль → Ажил</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatDuration(results.travelTimes.school_to_work?.duration_value || 1500)}
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-green-600">🏢</span>
                  <span className="mx-2">→</span>
                  <span className="text-yellow-600">🏫</span>
                  <span className="ml-2 text-sm font-medium">Ажил → Сургууль</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatDuration(results.travelTimes.work_to_school?.duration_value || 1500)}
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-600">🏫</span>
                  <span className="mx-2">→</span>
                  <span className="text-blue-600">🏠</span>
                  <span className="ml-2 text-sm font-medium">Сургууль → Гэр</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatDuration(results.travelTimes.school_to_home?.duration_value || 1500)}
                </div>
              </div>
            </div>

            {/* Time loss summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-600 text-white rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Өдөр тутам</h3>
                <div className="text-3xl font-bold mb-2">
                  {results.timeLoss.daily.hours} цаг
                </div>
                <div className="text-blue-200">
                  {results.timeLoss.daily.minutes} минут
                </div>
              </div>

              <div className="bg-green-600 text-white rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Сар тутам</h3>
                <div className="text-3xl font-bold mb-2">
                  {results.timeLoss.monthly.hours} цаг
                </div>
                <div className="text-green-200">
                  {results.timeLoss.monthly.days} өдөр
                </div>
              </div>

              <div className="bg-red-600 text-white rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Жил тутам</h3>
                <div className="text-3xl font-bold mb-2">
                  {results.timeLoss.yearly.days} өдөр
                </div>
                <div className="text-red-200">
                  {results.timeLoss.yearly.weeks} долоо хоног
                </div>
              </div>
            </div>

            {/* Weekly Chart */}
            <WeeklyChart timeLoss={results.timeLoss} />
          </div>
        )}

        <div className="text-center mt-8 text-gray-500">
          <p>Энд таны хувийн нууцлал хуучаадаа. Байршлын бүх өгөгдлийн нөөцөө нь хадгалагдахгүй болосоорууллаа.</p>
        </div>
      </div>
    </div>
  );
}

export default App;

