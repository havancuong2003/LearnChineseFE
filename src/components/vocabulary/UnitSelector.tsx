import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

interface Unit {
  unit: string;
  count: number;
}

interface UnitSelectorProps {
  selectedUnits: string[];
  onUnitsChange: (units: string[]) => void;
  orderMode: 'sequential' | 'random';
  onOrderModeChange: (mode: 'sequential' | 'random') => void;
}

const UnitSelector = ({ selectedUnits, onUnitsChange, orderMode, onOrderModeChange }: UnitSelectorProps) => {
  const { data: unitsData, isLoading } = useQuery({
    queryKey: ['vocab-units'],
    queryFn: async () => {
      const response = await api.get('/vocabs/units');
      return response.data as Unit[];
    },
  });

  const units = unitsData || [];

  const handleToggleUnit = (unit: string) => {
    if (selectedUnits.includes(unit)) {
      onUnitsChange(selectedUnits.filter((u) => u !== unit));
    } else {
      onUnitsChange([...selectedUnits, unit]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUnits.length === units.length) {
      onUnitsChange([]);
    } else {
      onUnitsChange(units.map((u) => u.unit));
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Đang tải units...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Chọn Unit để học</h3>

      <div className="mb-4">
        <button
          onClick={handleSelectAll}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          {selectedUnits.length === units.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {units.map((unit) => (
          <label
            key={unit.unit}
            className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <input
              type="checkbox"
              checked={selectedUnits.includes(unit.unit)}
              onChange={() => handleToggleUnit(unit.unit)}
              className="w-4 h-4"
            />
            <span className="text-sm">
              {unit.unit} ({unit.count})
            </span>
          </label>
        ))}
      </div>

      {selectedUnits.length > 0 && (
        <div className="border-t pt-4">
          <label className="block text-sm font-medium mb-2">Chế độ học:</label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="sequential"
                checked={orderMode === 'sequential'}
                onChange={(e) => onOrderModeChange('sequential')}
                className="w-4 h-4"
              />
              <span>Lần lượt từng unit</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="random"
                checked={orderMode === 'random'}
                onChange={(e) => onOrderModeChange('random')}
                className="w-4 h-4"
              />
              <span>Random tất cả</span>
            </label>
          </div>
        </div>
      )}

      {selectedUnits.length === 0 && (
        <p className="text-sm text-gray-500">Vui lòng chọn ít nhất 1 unit để bắt đầu học</p>
      )}
    </div>
  );
};

export default UnitSelector;

