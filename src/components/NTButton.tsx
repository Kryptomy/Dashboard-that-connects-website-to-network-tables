import React, { useEffect, useState } from 'react';
import { useNetworkTables } from '../NetworkTablesContext';
import { NetworkTablesTypeInfos } from 'ntcore-ts-client';

interface NTButtonProps {
  topic: string;
  label: string;
  initialValue?: boolean;
}

export const NTButton: React.FC<NTButtonProps> = ({ topic, label, initialValue = false }) => {
  const { nt } = useNetworkTables();
  const [value, setValue] = useState<boolean>(initialValue);

  useEffect(() => {
    if (!nt) return;

    const ntTopic = nt.createTopic<boolean>(topic, NetworkTablesTypeInfos.kBoolean, initialValue);
    
    // Publish immediately so the robot sees the initial value
    ntTopic.publish();

    const subuid = ntTopic.subscribe((newValue) => {
      if (newValue !== null) setValue(newValue);
    });

    return () => {
      ntTopic.unsubscribe(subuid);
    };
  }, [nt, topic, initialValue]);

  const handleClick = async () => {
    if (!nt) return;
    const ntTopic = nt.createTopic<boolean>(topic, NetworkTablesTypeInfos.kBoolean);
    
    // In NT4, you must be a publisher to set a value.
    // publish() is idempotent if already publishing.
    await ntTopic.publish();
    ntTopic.setValue(!value);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 rounded-lg font-bold transition-colors ${
        value ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      } hover:opacity-80 active:scale-95 w-full shadow-lg border-2 border-white/10`}
    >
      {label}: {value ? 'ON' : 'OFF'}
    </button>
  );
};
