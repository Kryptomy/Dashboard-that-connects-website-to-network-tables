import { NetworkTablesProvider, useNetworkTables } from './NetworkTablesContext';
import { NTButton } from './components/NTButton';
import { NTMomentaryButton } from './components/NTMomentaryButton';
import { NTNumberReadout } from './components/NTNumberReadout';
import { NTSlider } from './components/NTSlider';

const ConnectionStatus = () => {
  const { connected } = useNetworkTables();
  return (
    <div className={`fixed top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
      connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {connected ? '● Connected' : '○ Disconnected'}
    </div>
  );
};

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <ConnectionStatus />
      
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-blue-400">FRC Dashboard 2026</h1>
        <p className="text-gray-400 mt-2">Skeleton project for NT4 connection</p>
      </header>

      <main className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Toggle Buttons */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Toggle Controls</h2>
            <div className="flex flex-col gap-4">
              <NTButton topic="/dashboard/intake" label="Intake" initialValue={false} />
              <NTButton topic="/dashboard/shooter" label="Shooter" initialValue={true} />
            </div>
          </div>

          {/* Momentary Buttons */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Momentary Controls</h2>
            <div className="flex flex-col gap-4">
              <NTMomentaryButton topic="/dashboard/hippo" label="Hippo" />
            </div>
          </div>

          {/* Sensor Readouts */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Sensor Data</h2>
            <div className="flex flex-col gap-4">
              <NTNumberReadout topic="/dashboard/battery" label="Battery" unit="V" />
              <NTNumberReadout topic="/dashboard/time" label="Match Time" unit="s" precision={0} />
            </div>
          </div>
        </div>

        {/* Settings / Sliders Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NTSlider topic="/dashboard/detune" label="Drive Detune" min={0} max={1} step={0.05} />
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 border-dashed flex items-center justify-center">
            <p className="text-gray-500 text-center">More configuration settings here</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const robotIp = '127.0.0.1'; 

  return (
    <NetworkTablesProvider robotIp={robotIp}>
      <Dashboard />
    </NetworkTablesProvider>
  );
}

export default App;
