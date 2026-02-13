import React, { useEffect, useState } from 'react';
import { useNetworkTables } from '../NetworkTablesContext';
import { NetworkTablesTypeInfos } from 'ntcore-ts-client';

interface NTMomentaryButtonProps {
  topic: string;
  label: string;
}

export const NTMomentaryButton: React.FC<NTMomentaryButtonProps> = ({ topic, label }) => {
  const { nt } = useNetworkTables();
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!nt) return;
    const ntTopic = nt.createTopic<boolean>(topic, NetworkTablesTypeInfos.kBoolean, false);
    ntTopic.publish();
    
    const subuid = ntTopic.subscribe((val) => {
        if (val !== null) setPressed(val);
    });

    return () => {
        ntTopic.unsubscribe(subuid);
    };
  }, [nt, topic]);

  const handlePress = async () => {
    if (!nt) return;
    const ntTopic = nt.createTopic<boolean>(topic, NetworkTablesTypeInfos.kBoolean);
    await ntTopic.publish();
    ntTopic.setValue(true);
  };

  const handleRelease = async () => {
    if (!nt) return;
    const ntTopic = nt.createTopic<boolean>(topic, NetworkTablesTypeInfos.kBoolean);
    await ntTopic.publish();
    ntTopic.setValue(false);
  };

  return (
    <button
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={pressed ? handleRelease : undefined} // Safety: release if mouse leaves button
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
      className={`px-4 py-2 rounded-lg font-bold transition-all ${
        pressed 
          ? 'bg-yellow-500 text-black scale-95 shadow-inner' 
          : 'bg-gray-700 text-white shadow-lg border-2 border-white/5'
      } w-full select-none`}
    >
      {label} {pressed ? '(HOLDING)' : ''}
    </button>
  );
};
