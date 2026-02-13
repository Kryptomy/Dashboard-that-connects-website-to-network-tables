import { NetworkTablesProvider, useNetworkTables } from './NetworkTablesContext';
import { NTButton } from './components/NTButton';

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

      <main>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Example Buttons */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Robot Controls</h2>
            <div className="flex flex-col gap-4">
              <NTButton topic="/dashboard/intake" label="Intake" />
              <NTButton topic="/dashboard/shooter" label="Shooter" />
              <NTButton topic="/dashboard/climb" label="Climb" />
            </div>
          </div>

          {/* Placeholder for future widgets */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 border-dashed flex items-center justify-center">
            <p className="text-gray-500">More widgets can go here</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  // Replace '10.TE.AM.2' with your actual robot IP or 'localhost' for simulation
  const robotIp = '127.0.0.1'; 

  return (
    <NetworkTablesProvider robotIp={robotIp}>
      <Dashboard />
    </NetworkTablesProvider>
  );
}

export default App;
