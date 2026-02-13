import React, { useEffect, useState } from 'react';
import { useNetworkTables } from '../NetworkTablesContext';
import { NetworkTablesTypeInfos } from 'ntcore-ts-client';

interface NTSliderProps {
  topic: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}

export const NTSlider: React.FC<NTSliderProps> = ({ 
  topic, 
  label, 
  min = 0, 
  max = 1, 
  step = 0.01 
}) => {
  const { nt } = useNetworkTables();
  const [value, setValue] = useState<number>(min);

  useEffect(() => {
    if (!nt) return;

    const ntTopic = nt.createTopic<number>(topic, NetworkTablesTypeInfos.kDouble, min);
    
    // We want to be able to control this from the dashboard
    ntTopic.publish();

    const subuid = ntTopic.subscribe((newValue) => {
      if (newValue !== null) setValue(newValue);
    });

    return () => {
      ntTopic.unsubscribe(subuid);
    };
  }, [nt, topic, min]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    
    if (nt) {
      const ntTopic = nt.createTopic<number>(topic, NetworkTablesTypeInfos.kDouble);
      await ntTopic.publish();
      ntTopic.setValue(newValue);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <label className="text-xl font-semibold text-gray-200">{label}</label>
        <span className="text-blue-400 font-mono font-bold text-xl">
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};
