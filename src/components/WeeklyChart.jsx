import React from 'react';

const WeeklyChart = ({ timeLoss }) => {
  if (!timeLoss) return null;

  // Generate weekly data based on daily time loss
  const weeklyData = [
    { day: 'Даваа', hours: timeLoss.daily.hours, minutes: timeLoss.daily.minutes, isWorkday: true },
    { day: 'Мягмар', hours: timeLoss.daily.hours, minutes: timeLoss.daily.minutes, isWorkday: true },
    { day: 'Лхагва', hours: timeLoss.daily.hours, minutes: timeLoss.daily.minutes, isWorkday: true },
    { day: 'Пүрэв', hours: timeLoss.daily.hours, minutes: timeLoss.daily.minutes, isWorkday: true },
    { day: 'Баасан', hours: timeLoss.daily.hours, minutes: timeLoss.daily.minutes, isWorkday: true },
    { day: 'Бямба', hours: 0, minutes: 0, isWorkday: false }, // Weekend - no commute
    { day: 'Ням', hours: 0, minutes: 0, isWorkday: false }    // Weekend - no commute
  ];

  const maxHours = Math.max(...weeklyData.map(d => d.hours));
  const chartHeight = 200;

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
        7 хоногийн цаг алдалтын график
      </h3>
      
      {/* Simple Bar Chart */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">Өдөр тутмын цаг алдалт</h4>
        <div className="flex items-end justify-between bg-gray-50 p-4 rounded-lg" style={{ height: chartHeight + 60 }}>
          {weeklyData.map((day, index) => {
            const barHeight = maxHours > 0 ? (day.hours / maxHours) * chartHeight : 0;
            return (
              <div key={index} className="flex flex-col items-center flex-1 mx-1">
                <div className="text-xs text-gray-600 mb-2 font-medium">
                  {day.hours.toFixed(1)}ц
                </div>
                <div 
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    day.isWorkday ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300'
                  }`}
                  style={{ height: `${barHeight}px`, minHeight: day.hours > 0 ? '4px' : '0px' }}
                  title={`${day.day}: ${day.hours} цаг ${day.minutes} минут`}
                ></div>
                <div className="text-sm font-medium text-gray-700 mt-2">
                  {day.day}
                </div>
                <div className={`text-xs ${day.isWorkday ? 'text-blue-600' : 'text-gray-400'}`}>
                  {day.isWorkday ? 'Ажлын өдөр' : 'Амралт'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <h5 className="font-semibold text-blue-800 mb-2">Ажлын өдрүүд</h5>
          <div className="text-2xl font-bold text-blue-600">
            {(timeLoss.daily.hours * 5).toFixed(1)} цаг
          </div>
          <div className="text-sm text-blue-500">5 өдөр</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <h5 className="font-semibold text-green-800 mb-2">Амралтын өдрүүд</h5>
          <div className="text-2xl font-bold text-green-600">0 цаг</div>
          <div className="text-sm text-green-500">2 өдөр</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <h5 className="font-semibold text-purple-800 mb-2">7 хоногийн нийт</h5>
          <div className="text-2xl font-bold text-purple-600">
            {(timeLoss.daily.hours * 5).toFixed(1)} цаг
          </div>
          <div className="text-sm text-purple-500">
            {((timeLoss.daily.hours * 5) / 24).toFixed(1)} өдөр
          </div>
        </div>
      </div>

      {/* Progress Bar - Weekly vs Monthly */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">Сарын хэмжээнд ахиц</h4>
        <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
            style={{ width: `${((timeLoss.daily.hours * 5) / timeLoss.monthly.hours) * 100}%` }}
          >
            <span className="text-white text-xs font-semibold">
              {(((timeLoss.daily.hours * 5) / timeLoss.monthly.hours) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>7 хоног: {(timeLoss.daily.hours * 5).toFixed(1)} цаг</span>
          <span>Сарын нийт: {timeLoss.monthly.hours} цаг</span>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
          <span className="mr-2">📊</span>
          Дүн шинжилгээ
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Ажлын өдөр бүр <strong>{timeLoss.daily.hours} цаг {timeLoss.daily.minutes} минут</strong> цаг алддаг
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              7 хоногт нийт <strong>{(timeLoss.daily.hours * 5).toFixed(1)} цаг</strong> цаг алддаг
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              Амралтын өдрүүдэд зорчих шаардлагагүй
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              Жилд нийт <strong>{timeLoss.yearly.days} өдөр</strong> зорчилтод зарцуулдаг
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChart;

