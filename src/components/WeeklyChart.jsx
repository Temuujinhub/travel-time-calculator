import React, { useState } from 'react';

const WeeklyChart = ({ data, rushHourData }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewMode, setViewMode] = useState('normal'); // 'normal' or 'rushHour'

  if (!data) return null;

  // Use rush hour data if available and selected
  const chartData = viewMode === 'rushHour' && rushHourData ? rushHourData : data;
  
  const maxMinutes = Math.max(...chartData.map(d => d.minutes || 0));
  const chartHeight = 250;

  const getBarColor = (day, isSelected) => {
    if (isSelected) return 'bg-yellow-500';
    if (!day.isWorkday) return 'bg-gray-300';
    if (viewMode === 'rushHour') {
      return day.rushHour ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-400 hover:bg-orange-500';
    }
    return 'bg-blue-500 hover:bg-blue-600';
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ц ${mins}м`;
  };

  const totalWeeklyMinutes = chartData
    .filter(d => d.isWorkday !== false)
    .reduce((sum, d) => sum + (d.minutes || 0), 0);

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          7 хоногийн цаг алдалтын график
        </h3>
        
        {/* View Mode Toggle */}
        {rushHourData && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('normal')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'normal' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Энгийн цаг
            </button>
            <button
              onClick={() => setViewMode('rushHour')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'rushHour' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Ачаалалтай цаг
            </button>
          </div>
        )}
      </div>

      {/* Rush Hour Info */}
      {viewMode === 'rushHour' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-800">
            <span className="mr-2">🚦</span>
            <span className="font-medium">
              Ачаалалтай цагийн тооцоолол: Өглөө 7:00-9:00, Орой 17:00-19:00 (+30-50% удаан)
            </span>
          </div>
        </div>
      )}
      
      {/* Interactive Bar Chart */}
      <div className="mb-8">
        <div className="flex items-end justify-between bg-gray-50 p-6 rounded-lg relative" style={{ height: chartHeight + 80 }}>
          {/* Y-axis labels */}
          <div className="absolute left-2 top-6 bottom-16 flex flex-col justify-between text-xs text-gray-500">
            <span>{Math.round(maxMinutes)}м</span>
            <span>{Math.round(maxMinutes * 0.75)}м</span>
            <span>{Math.round(maxMinutes * 0.5)}м</span>
            <span>{Math.round(maxMinutes * 0.25)}м</span>
            <span>0м</span>
          </div>
          
          {/* Grid lines */}
          <div className="absolute left-12 right-6 top-6 bottom-16">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <div
                key={i}
                className="absolute w-full border-t border-gray-200"
                style={{ bottom: `${ratio * chartHeight}px` }}
              />
            ))}
          </div>

          {/* Bars */}
          <div className="flex items-end justify-between w-full ml-12 mr-6">
            {chartData.map((day, index) => {
              const barHeight = maxMinutes > 0 ? ((day.minutes || 0) / maxMinutes) * chartHeight : 0;
              const isSelected = selectedDay === index;
              
              return (
                <div 
                  key={index} 
                  className="flex flex-col items-center flex-1 mx-1 cursor-pointer group"
                  onClick={() => setSelectedDay(isSelected ? null : index)}
                >
                  {/* Value label */}
                  <div className={`text-xs mb-2 font-medium transition-colors ${
                    isSelected ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {formatTime(day.minutes || 0)}
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      getBarColor(day, isSelected)
                    } group-hover:shadow-lg`}
                    style={{ 
                      height: `${barHeight}px`, 
                      minHeight: (day.minutes || 0) > 0 ? '4px' : '0px' 
                    }}
                  />
                  
                  {/* Day label */}
                  <div className={`text-sm font-medium mt-3 transition-colors ${
                    isSelected ? 'text-yellow-600' : 'text-gray-700'
                  }`}>
                    {day.day}
                  </div>
                  
                  {/* Status */}
                  <div className={`text-xs mt-1 ${
                    !day.isWorkday ? 'text-gray-400' :
                    viewMode === 'rushHour' && day.rushHour ? 'text-red-500' :
                    isSelected ? 'text-yellow-500' : 'text-blue-500'
                  }`}>
                    {!day.isWorkday ? 'Амралт' : 
                     viewMode === 'rushHour' && day.rushHour ? 'Ачаалалтай' : 'Ажлын өдөр'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay !== null && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h5 className="font-semibold text-yellow-800 mb-2">
            {chartData[selectedDay].day} - Дэлгэрэнгүй мэдээлэл
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Нийт цаг:</span>
              <div className="font-medium">{formatTime(chartData[selectedDay].minutes || 0)}</div>
            </div>
            {viewMode === 'rushHour' && chartData[selectedDay].rushHour && (
              <div>
                <span className="text-gray-600">Нэмэгдэл:</span>
                <div className="font-medium text-red-600">+{chartData[selectedDay].extraMinutes || 0} мин</div>
              </div>
            )}
            <div>
              <span className="text-gray-600">Төрөл:</span>
              <div className="font-medium">
                {!chartData[selectedDay].isWorkday ? 'Амралтын өдөр' : 'Ажлын өдөр'}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Зорчилт:</span>
              <div className="font-medium">
                {!chartData[selectedDay].isWorkday ? 'Байхгүй' : 'Гэр→Сургууль→Ажил→Гэр'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <h5 className="font-semibold text-blue-800 mb-2">Ажлын өдрүүд</h5>
          <div className="text-2xl font-bold text-blue-600">
            {formatTime(totalWeeklyMinutes)}
          </div>
          <div className="text-sm text-blue-500">5 өдөр</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <h5 className="font-semibold text-green-800 mb-2">Өдрийн дундаж</h5>
          <div className="text-2xl font-bold text-green-600">
            {formatTime(Math.round(totalWeeklyMinutes / 5))}
          </div>
          <div className="text-sm text-green-500">Ажлын өдөрт</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <h5 className="font-semibold text-purple-800 mb-2">Сарын тооцоо</h5>
          <div className="text-2xl font-bold text-purple-600">
            {formatTime(totalWeeklyMinutes * 4.33)}
          </div>
          <div className="text-sm text-purple-500">
            ≈ {((totalWeeklyMinutes * 4.33) / (24 * 60)).toFixed(1)} өдөр
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      {viewMode === 'rushHour' && rushHourData && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">Энгийн цаг vs Ачаалалтай цагийн харьцуулалт</h4>
          <div className="space-y-3">
            {data.filter(d => d.isWorkday !== false).map((normalDay, index) => {
              const rushDay = rushHourData.find(r => r.day === normalDay.day);
              if (!rushDay) return null;
              
              const normalMinutes = normalDay.minutes || 0;
              const rushMinutes = rushDay.minutes || 0;
              const difference = rushMinutes - normalMinutes;
              
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-16 text-sm font-medium text-gray-700">{normalDay.day}</div>
                  <div className="flex-1 flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                      <div 
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${(normalMinutes / rushMinutes) * 100}%` }}
                      />
                      <div 
                        className="bg-red-500 h-full rounded-r-full absolute top-0"
                        style={{ 
                          left: `${(normalMinutes / rushMinutes) * 100}%`,
                          width: `${(difference / rushMinutes) * 100}%`
                        }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 w-20">
                      +{difference} мин
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span>Энгийн цаг</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span>Нэмэгдэх цаг</span>
            </div>
          </div>
        </div>
      )}

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
              7 хоногт нийт <strong>{formatTime(totalWeeklyMinutes)}</strong> цаг алддаг
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              Өдрийн дундаж <strong>{formatTime(Math.round(totalWeeklyMinutes / 5))}</strong>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              Амралтын өдрүүдэд зорчих шаардлагагүй
            </li>
            {viewMode === 'rushHour' && (
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Ачаалалтай цагт <strong>30-50% удаан</strong> зорчидог
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChart;

