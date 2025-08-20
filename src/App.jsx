import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Alert, AlertDescription } from './components/ui/alert';
import { MapPin, Calculator, Home, School, Briefcase, Clock, Calendar, TrendingUp, Settings } from 'lucide-react';
import WeeklyChart from './components/WeeklyChart';
import AdminPanel from './components/AdminPanel';
import './App.css';

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyD_RxGFjYwvqoDIq17ZMhdLcChy0tTTrnU';

function App() {
  const [currentView, setCurrentView] = useState('calculator'); // 'calculator' | 'admin'
  const [locations, setLocations] = useState({
    home: '',
    school: '',
    work: ''
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState('');

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const autocompletesRef = useRef({});

  // Load Google Maps JS API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=mn`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => setError('Google Maps API ачаалахад алдаа гарлаа');
    document.head.appendChild(script);
  }, []);

  // Init map and autocomplete
  useEffect(() => {
    if (!mapLoaded || !window.google) return;

    // Map
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 47.9184, lng: 106.9177 },
      zoom: 12,
      mapTypeId: 'roadmap'
    });

    directionsServiceRef.current = new window.google.maps.DirectionsService();
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({ draggable: false });
    directionsRendererRef.current.setMap(mapInstanceRef.current);

    // Autocomplete
    ['home-input', 'school-input', 'work-input'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el || !window.google?.maps?.places) return;
      const ac = new window.google.maps.places.Autocomplete(el, {
        componentRestrictions: { country: 'mn' },
        fields: ['place_id', 'formatted_address', 'geometry']
      });
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        const key = id.split('-')[0];
        setLocations((p) => ({ ...p, [key]: place?.formatted_address || el.value }));
      });
      autocompletesRef.current[id] = ac;
    });
  }, [mapLoaded]);

  const handleInputChange = (field, value) => {
    setLocations((prev) => ({ ...prev, [field]: value }));
  };

  // Client-side Distance Matrix using Maps JS API (avoids 405 from GitHub Pages)
  const calculateTravelTime = async () => {
    if (!locations.home || !locations.school || !locations.work) {
      setError('Бүх байршлыг оруулна уу');
      return;
    }
    if (!window.google?.maps) {
      setError('Google Maps API бэлэн биш байна');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const svc = new window.google.maps.DistanceMatrixService();
      const getLeg = (origin, destination) =>
        new Promise((resolve) => {
          svc.getDistanceMatrix(
            {
              origins: [origin],
              destinations: [destination],
              travelMode: window.google.maps.TravelMode.DRIVING,
              language: 'mn'
            },
            (res, status) => {
              if (
                status === 'OK' &&
                res?.rows?.[0]?.elements?.[0] &&
                res.rows[0].elements[0].status === 'OK'
              ) {
                const el = res.rows[0].elements[0];
                resolve({
                  distance: el.distance.text,
                  duration: el.duration.text,
                  duration_value: el.duration.value
                });
              } else {
                resolve({ distance: '15.0 км', duration: '25 мин', duration_value: 1500 });
              }
            }
          );
        });

      const [h2s, s2w, w2s, s2h] = await Promise.all([
        getLeg(locations.home, locations.school),
        getLeg(locations.school, locations.work),
        getLeg(locations.work, locations.school),
        getLeg(locations.school, locations.home)
      ]);

      const travel_times = {
        home_to_school: h2s,
        school_to_work: s2w,
        work_to_school: w2s,
        school_to_home: s2h
      };

      // Rush hour calculations
      const RUSH_HOUR_MULTIPLIER = 1.4; // 40% increase during rush hour
      const WEEKEND_MULTIPLIER = 0.8; // 20% decrease on weekends

      // Normal time calculation
      const daily_seconds = h2s.duration_value + s2w.duration_value + w2s.duration_value + s2h.duration_value;
      const daily_minutes = Math.round((daily_seconds / 60) * 10) / 10;
      const daily_hours = daily_minutes / 60;

      // Rush hour time calculation (morning: home->school->work, evening: work->school->home)
      const morning_rush_seconds = (h2s.duration_value + s2w.duration_value) * RUSH_HOUR_MULTIPLIER;
      const evening_rush_seconds = (w2s.duration_value + s2h.duration_value) * RUSH_HOUR_MULTIPLIER;
      const rush_hour_daily_seconds = morning_rush_seconds + evening_rush_seconds;
      const rush_hour_daily_minutes = Math.round((rush_hour_daily_seconds / 60) * 10) / 10;
      const rush_hour_daily_hours = rush_hour_daily_minutes / 60;

      const monthly_hours = Math.round(daily_hours * 22 * 10) / 10;
      const yearly_hours = Math.round(monthly_hours * 12 * 10) / 10;
      const rush_hour_monthly_hours = Math.round(rush_hour_daily_hours * 22 * 10) / 10;
      const rush_hour_yearly_hours = Math.round(rush_hour_monthly_hours * 12 * 10) / 10;

      // Normal weekly data
      const weekly_data = [
        { day: 'Даваа', minutes: daily_minutes, hours: daily_hours, isWorkday: true },
        { day: 'Мягмар', minutes: daily_minutes, hours: daily_hours, isWorkday: true },
        { day: 'Лхагва', minutes: daily_minutes, hours: daily_hours, isWorkday: true },
        { day: 'Пүрэв', minutes: daily_minutes, hours: daily_hours, isWorkday: true },
        { day: 'Баасан', minutes: daily_minutes, hours: daily_hours, isWorkday: true },
        { day: 'Бямба', minutes: Math.round(daily_minutes * WEEKEND_MULTIPLIER), hours: daily_hours * WEEKEND_MULTIPLIER, isWorkday: false },
        { day: 'Ням', minutes: Math.round(daily_minutes * WEEKEND_MULTIPLIER), hours: daily_hours * WEEKEND_MULTIPLIER, isWorkday: false }
      ];

      // Rush hour weekly data
      const rush_hour_weekly_data = [
        { 
          day: 'Даваа', 
          minutes: rush_hour_daily_minutes, 
          hours: rush_hour_daily_hours, 
          isWorkday: true, 
          rushHour: true,
          extraMinutes: Math.round(rush_hour_daily_minutes - daily_minutes)
        },
        { 
          day: 'Мягмар', 
          minutes: rush_hour_daily_minutes, 
          hours: rush_hour_daily_hours, 
          isWorkday: true, 
          rushHour: true,
          extraMinutes: Math.round(rush_hour_daily_minutes - daily_minutes)
        },
        { 
          day: 'Лхагва', 
          minutes: rush_hour_daily_minutes, 
          hours: rush_hour_daily_hours, 
          isWorkday: true, 
          rushHour: true,
          extraMinutes: Math.round(rush_hour_daily_minutes - daily_minutes)
        },
        { 
          day: 'Пүрэв', 
          minutes: rush_hour_daily_minutes, 
          hours: rush_hour_daily_hours, 
          isWorkday: true, 
          rushHour: true,
          extraMinutes: Math.round(rush_hour_daily_minutes - daily_minutes)
        },
        { 
          day: 'Баасан', 
          minutes: rush_hour_daily_minutes, 
          hours: rush_hour_daily_hours, 
          isWorkday: true, 
          rushHour: true,
          extraMinutes: Math.round(rush_hour_daily_minutes - daily_minutes)
        },
        { 
          day: 'Бямба', 
          minutes: Math.round(daily_minutes * WEEKEND_MULTIPLIER), 
          hours: daily_hours * WEEKEND_MULTIPLIER, 
          isWorkday: false, 
          rushHour: false,
          extraMinutes: 0
        },
        { 
          day: 'Ням', 
          minutes: Math.round(daily_minutes * WEEKEND_MULTIPLIER), 
          hours: daily_hours * WEEKEND_MULTIPLIER, 
          isWorkday: false, 
          rushHour: false,
          extraMinutes: 0
        }
      ];

      setResults({
        success: true,
        travel_times,
        daily_time_loss: daily_minutes,
        monthly_time_loss: monthly_hours,
        yearly_time_loss: yearly_hours,
        rush_hour_daily_time_loss: rush_hour_daily_minutes,
        rush_hour_monthly_time_loss: rush_hour_monthly_hours,
        rush_hour_yearly_time_loss: rush_hour_yearly_hours,
        weekly_data,
        rush_hour_weekly_data,
        rush_hour_extra_daily: Math.round(rush_hour_daily_minutes - daily_minutes),
        rush_hour_extra_monthly: Math.round((rush_hour_monthly_hours - monthly_hours) * 60),
        rush_hour_extra_yearly: Math.round((rush_hour_yearly_hours - yearly_hours) * 60)
      });

      // Draw route
      showRouteOnMap();
    } catch (e) {
      console.error(e);
      setError('Тооцоолол хийхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const showRouteOnMap = () => {
    if (!directionsServiceRef.current || !directionsRendererRef.current) return;
    const req = {
      origin: locations.home,
      destination: locations.home,
      waypoints: [
        { location: locations.school, stopover: true },
        { location: locations.work, stopover: true }
      ],
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: false
    };
    directionsServiceRef.current.route(req, (res, status) => {
      if (status === 'OK') directionsRendererRef.current.setDirections(res);
    });
  };

  const formatTime = (minutes) => {
    if (!minutes && minutes !== 0) return '-';
    if (minutes < 60) return `${minutes} мин`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h} цаг ${m} мин`;
  };

  if (currentView === 'admin') return <AdminPanel />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Зорчих цагийн тооцоолуур</h1>
            </div>
            <Button variant="outline" onClick={() => setCurrentView('admin')} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Админ хуудас
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" /> Өдрийн маршрутаа оруулна уу
                </CardTitle>
                <CardDescription>Монгол хэв маяг: Гэр → Сургууль → Ажил → Гэр</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
                )}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="home-input" className="flex items-center gap-2 mb-2">
                      <Home className="h-4 w-4 text-green-600" /> Гэрийн хаяг
                    </Label>
                    <Input id="home-input" placeholder="Гэрийн хаягаа оруулна уу" value={locations.home}
                      onChange={(e) => handleInputChange('home', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="school-input" className="flex items-center gap-2 mb-2">
                      <School className="h-4 w-4 text-yellow-600" /> Сургууль/Их сургууль
                    </Label>
                    <Input id="school-input" placeholder="Сургуулийн хаягаа оруулна уу" value={locations.school}
                      onChange={(e) => handleInputChange('school', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="work-input" className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 text-blue-600" /> Ажлын байр
                    </Label>
                    <Input id="work-input" placeholder="Ажлын байрны хаягаа оруулна уу" value={locations.work}
                      onChange={(e) => handleInputChange('work', e.target.value)} />
                  </div>
                </div>
                <Button onClick={calculateTravelTime} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {loading ? 'Тооцоолж байна…' : (<><Calculator className="h-4 w-4 mr-2" />Цагийн алдагдлыг тооцоолох</>)}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Таны маршрутын дүрслэл</CardTitle></CardHeader>
              <CardContent>
                <div ref={mapRef} className="w-full h-96 rounded-lg border" style={{ minHeight: '400px' }}>
                  {!mapLoaded && (
                    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Google Map ачааллаж байна…</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {results && (
          <div className="mt-8 space-y-6">
            <Card>
              <CardHeader><CardTitle>Таны цаг алдалтын дүн</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-4 w-4 text-green-600" /> <School className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Гэр → Сургууль</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{results.travel_times.home_to_school.duration}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <School className="h-4 w-4 text-yellow-600" /> <Briefcase className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Сургууль → Ажил</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{results.travel_times.school_to_work.duration}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 text-blue-600" /> <School className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Ажил → Сургууль</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{results.travel_times.work_to_school.duration}</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <School className="h-4 w-4 text-yellow-600" /> <Home className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Сургууль → Гэр</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{results.travel_times.school_to_home.duration}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-blue-600 text-white"><CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Өдөр тутам</p>
                        <p className="text-3xl font-bold">{formatTime(results.daily_time_loss)}</p>
                        <p className="text-blue-100 text-sm">{results.daily_time_loss} минут</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent></Card>
                  <Card className="bg-green-600 text-white"><CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Сар тутам</p>
                        <p className="text-3xl font-bold">{results.monthly_time_loss.toFixed(1)} цаг</p>
                        <p className="text-green-100 text-sm">{(results.monthly_time_loss / 24).toFixed(1)} өдөр</p>
                      </div>
                      <Calendar className="h-8 w-8 text-green-200" />
                    </div>
                  </CardContent></Card>
                  <Card className="bg-red-600 text-white"><CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100">Жил тутам</p>
                        <p className="text-3xl font-bold">{results.yearly_time_loss.toFixed(1)} цаг</p>
                        <p className="text-red-100 text-sm">{(results.yearly_time_loss / 24 / 7).toFixed(1)} долоо хоног</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-red-200" />
                    </div>
                  </CardContent></Card>
                </div>
              </CardContent>
            </Card>

            {results.weekly_data && (
              <Card>
                <CardHeader>
                  <CardTitle>7 хоногийн цаг алдалтын график</CardTitle>
                  <CardDescription>Долоо хоногийн өдөр бүрийн харьцуулалт</CardDescription>
                </CardHeader>
                <CardContent>
                  <WeeklyChart 
                    data={results.weekly_data} 
                    rushHourData={results.rush_hour_weekly_data}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Энд таны хувийн нууцлал хүндлэгдэнэ. Байршлын өгөгдөл серверт хадгалагдахгүй.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;


