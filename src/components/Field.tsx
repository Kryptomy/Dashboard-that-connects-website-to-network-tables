import React, { useState, useRef, useEffect } from 'react';
import fieldImage from '../assets/2026 FRC.png';
import { useNetworkTables } from '../NetworkTablesContext';
import { NetworkTablesTopic, NetworkTablesTypeInfos } from 'ntcore-ts-client';

// A palette of distinct colors for locked waypoints
const WAYPOINT_COLORS = ['#00FF00', '#00FFFF', '#FFA500', '#FF00FF', '#FFFF00', '#FFFFFF']; // Lime, Aqua, Orange, Fuchsia, Yellow, White

interface Waypoint {
  pixel: { x: number; y: number };
  pose: { x: number; y: number };
  status: 'current' | 'locked';
  color: string;
}

const Field: React.FC = () => {
  const { nt, connected } = useNetworkTables();
  const imageRef = useRef<HTMLImageElement>(null);
  const [renderedImageDimensions, setRenderedImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  // Refs to hold the NetworkTables topics
  const waypointsTopicRef = useRef<NetworkTablesTopic<string> | null>(null);
  const clickXTopicRef = useRef<NetworkTablesTopic<number> | null>(null);
  const clickYTopicRef = useRef<NetworkTablesTopic<number> | null>(null);

  const fieldLengthFeet = 57.5; // X-axis
  const fieldWidthFeet = 26.4;  // Y-axis

  // Effect to set up NetworkTables topics
  useEffect(() => {
    if (!nt || !connected) return;

    // Create topics and store them in refs
    waypointsTopicRef.current = nt.createTopic<string>('/dashboard/field/waypoints', NetworkTablesTypeInfos.kString);
    clickXTopicRef.current = nt.createTopic<number>('/dashboard/field/clickX', NetworkTablesTypeInfos.kDouble);
    clickYTopicRef.current = nt.createTopic<number>('/dashboard/field/clickY', NetworkTablesTypeInfos.kDouble);
    
    // Asynchronously publish the topics
    const publishTopics = async () => {
      try {
        await waypointsTopicRef.current?.publish();
        await clickXTopicRef.current?.publish();
        await clickYTopicRef.current?.publish();
      } catch (e) {
        console.error("Failed to publish field topics:", e);
      }
    };
    
    publishTopics();

    return () => {
      waypointsTopicRef.current?.unpublish();
      clickXTopicRef.current?.unpublish();
      clickYTopicRef.current?.unpublish();
    };
  }, [nt, connected]);

  // Effect to get image dimensions for coordinate scaling
  useEffect(() => {
    const updateDimensions = () => {
      if (imageRef.current) {
        setRenderedImageDimensions({ width: imageRef.current.offsetWidth, height: imageRef.current.offsetHeight });
      }
    };
    if (imageRef.current) {
      if (imageRef.current.complete) updateDimensions();
      imageRef.current.addEventListener('load', updateDimensions);
    }
    window.addEventListener('resize', updateDimensions);
    return () => {
      if (imageRef.current) imageRef.current.removeEventListener('load', updateDimensions);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Effect to update NetworkTables when locked waypoints change
  useEffect(() => {
    const lockedWaypoints = waypoints
      .filter(wp => wp.status === 'locked')
      .map(wp => ({ pose: wp.pose, color: wp.color }));
      
    waypointsTopicRef.current?.setValue(JSON.stringify(lockedWaypoints));
  }, [waypoints]);

  const handleFieldClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!renderedImageDimensions) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clickXInPixels = event.clientX - rect.left;
    const clickYInPixels = event.clientY - rect.top;

    const xFeet = (clickXInPixels / renderedImageDimensions.width) * fieldLengthFeet;
    const yFeet = (clickYInPixels / renderedImageDimensions.height) * fieldWidthFeet;
    
    const pose = { x: parseFloat(xFeet.toFixed(2)), y: parseFloat(yFeet.toFixed(2)) };

    const newWaypoint: Waypoint = {
      pixel: { x: clickXInPixels, y: clickYInPixels },
      pose: pose,
      status: 'current',
      color: 'red',
    };

    setWaypoints(prev => [...prev.filter(wp => wp.status !== 'current'), newWaypoint]);
    
    // Update the single-click topics
    clickXTopicRef.current?.setValue(pose.x);
    clickYTopicRef.current?.setValue(pose.y);
  };

  const handleLockPose = () => {
    setWaypoints(prev => {
      const lockedCount = prev.filter(wp => wp.status === 'locked').length;
      const nextColor = WAYPOINT_COLORS[lockedCount % WAYPOINT_COLORS.length];
      return prev.map(wp => 
        wp.status === 'current' ? { ...wp, status: 'locked', color: nextColor } : wp
      );
    });
  };

  const handleClearWaypoints = () => {
    setWaypoints([]);
  };

  const hasCurrentWaypoint = waypoints.some(wp => wp.status === 'current');

  return (
    <div>
      <h2>2026 FRC Field</h2>
      <div style={{ position: 'relative', width: '100%', paddingBottom: `${(fieldWidthFeet / fieldLengthFeet) * 100}%`, overflow: 'hidden' }}>
        <img ref={imageRef} src={fieldImage} alt="2026 FRC Field" onClick={handleFieldClick} style={{ cursor: 'crosshair', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
        {waypoints.map((wp, index) => (
          <div key={index} style={{
              position: 'absolute',
              left: wp.pixel.x - 5,
              top: wp.pixel.y - 5,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: wp.color,
              border: '1px solid white',
              zIndex: 10,
            }}
          />
        ))}
      </div>
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleLockPose}
          disabled={!hasCurrentWaypoint}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Lock Pose
        </button>
        <button
          onClick={handleClearWaypoints}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700"
        >
          Remove All Waypoints
        </button>
      </div>

      {waypoints.find(wp => wp.status === 'current') && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-200 mb-2">Current Waypoint (feet):</h3>
          <p className="text-gray-300">
            X: {waypoints.find(wp => wp.status === 'current')?.pose.x.toFixed(2)} ft, 
            Y: {waypoints.find(wp => wp.status === 'current')?.pose.y.toFixed(2)} ft
          </p>
        </div>
      )}

      {waypoints.filter(wp => wp.status === 'locked').length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-200 mb-2">Locked Waypoints:</h3>
          <ul className="space-y-1">
            {waypoints.filter(wp => wp.status === 'locked').map((wp, index) => (
              <li key={index} className="flex items-center text-gray-300">
                <span style={{ backgroundColor: wp.color }} className="w-4 h-4 rounded-full mr-2 border border-gray-400"></span>
                <span>X: {wp.pose.x.toFixed(2)} ft, Y: {wp.pose.y.toFixed(2)} ft</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Field;
