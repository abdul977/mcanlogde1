import React from 'react';

const SimpleChart = ({ data, type = 'bar', title, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue || 1;

  if (type === 'bar') {
    return (
      <div className="bg-white p-4 rounded-lg border">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="flex items-end justify-between space-x-2" style={{ height: `${height}px` }}>
          {data.map((item, index) => {
            const barHeight = ((item.value - minValue) / range) * (height - 40);
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="text-xs text-gray-600 mb-1">
                  {item.value.toLocaleString()}
                </div>
                <div
                  className="bg-blue-500 rounded-t w-full min-h-[4px] transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${Math.max(barHeight, 4)}px` }}
                  title={`${item.label}: ${item.value.toLocaleString()}`}
                ></div>
                <div className="text-xs text-gray-700 mt-2 text-center">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'line') {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((item.value - minValue) / range) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="bg-white p-4 rounded-lg border">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="relative" style={{ height: `${height}px` }}>
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              points={points}
            />
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.value - minValue) / range) * 80;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#3B82F6"
                  className="hover:r-3 transition-all"
                >
                  <title>{`${item.label}: ${item.value.toLocaleString()}`}</title>
                </circle>
              );
            })}
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600">
            {data.map((item, index) => (
              <span key={index} className="text-center">
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
    ];

    return (
      <div className="bg-white p-4 rounded-lg border">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="flex items-center">
          <div className="relative" style={{ width: '200px', height: '200px' }}>
            <svg className="w-full h-full" viewBox="0 0 200 200">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const angle = (item.value / total) * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                
                const startX = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
                const startY = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
                const endX = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
                const endY = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                
                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${startX} ${startY}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                  'Z'
                ].join(' ');
                
                currentAngle += angle;
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={colors[index % colors.length]}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <title>{`${item.label}: ${item.value.toLocaleString()} (${percentage.toFixed(1)}%)`}</title>
                  </path>
                );
              })}
            </svg>
          </div>
          <div className="ml-6 flex-1">
            {data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center mb-2">
                  <div
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <span className="text-sm text-gray-700">
                    {item.label}: {item.value.toLocaleString()} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SimpleChart;
