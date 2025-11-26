import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_ADDRESS = (process.env.REACT_APP_ADMIN_ADDRESS || '').toLowerCase();

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [accessLogs, setAccessLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);
  const [logsError, setLogsError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    newAddress: '',
    name: '',
    role: ''
  });
  const [registerMessage, setRegisterMessage] = useState('');
  const [grantForm, setGrantForm] = useState({
    requester: '',
    resource: ''
  });
  const [isGranting, setIsGranting] = useState(false);
  const [grantMessage, setGrantMessage] = useState('');

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      setIsConnecting(true);
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setRegisterMessage('');
      } catch (error) {
        console.error('Error connecting to wallet:', error);
        setRegisterMessage('Failed to connect wallet. Please try again.');
      } finally {
        setIsConnecting(false);
      }
    } else {
      setRegisterMessage('MetaMask is not installed. Please install MetaMask to use this app.');
    }
  };

  // Grant access between two devices/resources
  const grantAccess = async (e) => {
    e.preventDefault();
    if (!walletAddress) {
      setGrantMessage('Please connect your wallet first.');
      return;
    }
    if (!grantForm.requester || !grantForm.resource) {
      setGrantMessage('Both requester and resource addresses are required.');
      return;
    }

    setIsGranting(true);
    setGrantMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/grant-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(grantForm),
      });

      const data = await response.json();

      if (data.success) {
        setGrantMessage(`Access granted! Transaction: ${data.txHash}`);
        setGrantForm({ requester: '', resource: '' });
      } else {
        setGrantMessage(`Grant failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error granting access:', error);
      setGrantMessage('Failed to grant access. Please verify the backend is running.');
    } finally {
      setIsGranting(false);
    }
  };

  // Register a new device
  const registerDevice = async (e) => {
    e.preventDefault();
    if (!walletAddress) {
      setRegisterMessage('Please connect your wallet first.');
      return;
    }

    if (!registerForm.newAddress || !registerForm.name || !registerForm.role) {
      setRegisterMessage('Please fill in all fields.');
      return;
    }

    setIsRegistering(true);
    setRegisterMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (data.success) {
        setRegisterMessage(`Device registered successfully! Transaction: ${data.txHash}`);
        setRegisterForm({ newAddress: '', name: '', role: '' });
      } else {
        setRegisterMessage(`Registration failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error registering device:', error);
      setRegisterMessage('Failed to register device. Please check if the backend is running.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Fetch access logs
  const fetchAccessLogs = async ({ manual = false } = {}) => {
    if (manual) {
      setIsRefreshingLogs(true);
    }
    try {
      if (!manual && accessLogs.length === 0) {
        setIsLoadingLogs(true);
      }

      const response = await fetch(`${API_BASE_URL}/access-logs`);
      const data = await response.json();
      
      if (data.success) {
        setAccessLogs(data.logs);
        setLogsError('');
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch logs:', data.message);
        setLogsError(data.message || 'Failed to fetch logs.');
      }
    } catch (error) {
      console.error('Error fetching access logs:', error);
      setLogsError('Unable to reach the backend API. Is it running?');
    } finally {
      setIsLoadingLogs(false);
      if (manual) {
        setIsRefreshingLogs(false);
      }
    }
  };

  // Fetch logs every 5 seconds
  useEffect(() => {
    fetchAccessLogs();
    const interval = setInterval(fetchAccessLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  // Truncate wallet address for display
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const totalLogs = accessLogs.length;
  const successCount = accessLogs.filter((log) => log.isSuccess).length;
  const failureCount = Math.max(totalLogs - successCount, 0);
  const latestLog = accessLogs[0];
  const normalizedWallet = walletAddress ? walletAddress.toLowerCase() : '';
  const isAdminWallet = ADMIN_ADDRESS
    ? normalizedWallet === ADMIN_ADDRESS
    : Boolean(walletAddress);
  const adminAddressLabel = ADMIN_ADDRESS ? truncateAddress(ADMIN_ADDRESS) : 'Not configured';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-400 mb-4">
            BlockAuth IoT Access Control
          </h1>
          <p className="text-gray-300 text-lg">
            Blockchain-based IoT device management and access monitoring
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-300">Wallet Connection</h2>
          {!walletAddress ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium">Connected</span>
              </div>
              <div className="bg-gray-700 px-4 py-2 rounded-lg font-mono">
                {truncateAddress(walletAddress)}
              </div>
            </div>
          )}
        </div>

        {/* Administrator Console */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-blue-300">Administrator Console</h2>
              <p className="text-gray-400 text-sm mt-1">
                Register devices, assign permissions, and manage the RBAC graph. Visible only to the admin wallet.
              </p>
            </div>
            <div className="text-sm text-gray-400">
              Admin wallet:{' '}
              <span className="font-mono text-blue-200">{adminAddressLabel}</span>
            </div>
          </div>

          {!walletAddress && (
            <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4 text-sm text-gray-200">
              Connect the administrator wallet to unlock device management tools.
            </div>
          )}

          {walletAddress && !isAdminWallet && (
            <div className="bg-yellow-700/20 border border-yellow-500 text-yellow-100 rounded-lg p-4 text-sm mb-4">
              You are connected as <span className="font-mono">{truncateAddress(walletAddress)}</span>. Switch to the administrator wallet ({adminAddressLabel})
              to register devices or change permissions.
            </div>
          )}

          {isAdminWallet && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-5">
                <h3 className="text-xl font-semibold text-blue-200 mb-4">Register New Device</h3>
                <form onSubmit={registerDevice} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Device Address
                      </label>
                      <input
                        type="text"
                        value={registerForm.newAddress}
                        onChange={(e) => setRegisterForm({ ...registerForm, newAddress: e.target.value })}
                        placeholder="0x..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Device Name
                      </label>
                      <input
                        type="text"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        placeholder="e.g., Security Camera"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Device Role
                      </label>
                      <input
                        type="text"
                        value={registerForm.role}
                        onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                        placeholder="e.g., Device_Camera"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {isRegistering ? 'Registering...' : 'Register Device'}
                    </button>
                    {registerMessage && (
                      <div className={`px-4 py-2 rounded-lg text-sm ${
                        registerMessage.toLowerCase().includes('success') 
                          ? 'bg-green-600 text-white' 
                          : registerMessage.toLowerCase().includes('failed') 
                          ? 'bg-red-600 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        {registerMessage}
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-5">
                <h3 className="text-xl font-semibold text-blue-200 mb-4">Grant Access</h3>
                <form onSubmit={grantAccess} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Requester Address
                    </label>
                    <input
                      type="text"
                      value={grantForm.requester}
                      onChange={(e) => setGrantForm({ ...grantForm, requester: e.target.value })}
                      placeholder="Device/User requesting access"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Resource Address
                    </label>
                    <input
                      type="text"
                      value={grantForm.resource}
                      onChange={(e) => setGrantForm({ ...grantForm, resource: e.target.value })}
                      placeholder="Resource that should be accessible"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      type="submit"
                      disabled={isGranting}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {isGranting ? 'Granting...' : 'Grant Access'}
                    </button>
                    {grantMessage && (
                      <div className={`px-4 py-2 rounded-lg text-sm ${
                        grantMessage.toLowerCase().includes('granted') 
                          ? 'bg-green-600 text-white' 
                          : grantMessage.toLowerCase().includes('failed') 
                          ? 'bg-red-600 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        {grantMessage}
                      </div>
                    )}
                  </div>
                </form>
                <div className="mt-4 text-sm text-gray-400">
                  Tip: Use the addresses from Hardhat accounts #1-#5 to mirror the predefined IoT devices, then grant the required
                  combinations (e.g., Employee Fob → Smart Lock).
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Access Logs Viewer */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-blue-300">Access Logs</h2>
              <p className="text-sm text-gray-400 mt-1">
                Monitor every access attempt between registered devices in real time.
              </p>
            </div>
            <button
              onClick={() => fetchAccessLogs({ manual: true })}
              disabled={isRefreshingLogs}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isRefreshingLogs ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-400">
                {lastUpdated
                  ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
                  : 'Logs update every 5 seconds'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="bg-gray-700 px-4 py-2 rounded-lg text-sm">
                Total Attempts:{' '}
                <span className="font-semibold text-blue-200">{totalLogs}</span>
              </div>
              <div className="bg-green-700/40 px-4 py-2 rounded-lg text-sm">
                Success:{' '}
                <span className="font-semibold text-green-200">{successCount}</span>
              </div>
              <div className="bg-red-700/40 px-4 py-2 rounded-lg text-sm">
                Failed:{' '}
                <span className="font-semibold text-red-200">{failureCount}</span>
              </div>
            </div>
          </div>

          {logsError && (
            <div className="bg-red-700/60 border border-red-600 text-sm text-white px-4 py-2 rounded mb-4">
              {logsError}
            </div>
          )}

          {isLoadingLogs ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Loading logs...</div>
            </div>
          ) : totalLogs === 0 ? (
            <div className="bg-gray-900/50 border border-dashed border-gray-700 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-2">No access logs yet</h3>
              <p className="text-gray-400 text-sm">
                Start the IoT simulation to generate traffic:
              </p>
              <ol className="list-decimal list-inside text-gray-300 text-sm mt-3 space-y-1">
                <li>Run <code className="bg-gray-700 px-2 py-1 rounded text-xs">npx hardhat node</code></li>
                <li>Start the backend at <code className="bg-gray-700 px-2 py-1 rounded text-xs">localhost:5000</code></li>
                <li>Execute <code className="bg-gray-700 px-2 py-1 rounded text-xs">node scripts/run-simulation.js</code></li>
              </ol>
              <p className="text-gray-400 text-sm mt-3">
                Access attempts will appear here automatically once devices start interacting.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {latestLog && (
                <div className="bg-gradient-to-r from-blue-900/60 to-blue-700/30 border border-blue-600 rounded-lg p-4">
                  <p className="text-sm text-blue-200 uppercase tracking-wide mb-1">Latest Event</p>
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{latestLog.timestamp}</p>
                      <p className="text-sm text-blue-200 mt-1">
                        {truncateAddress(latestLog.requester)} ➜ {truncateAddress(latestLog.resource)}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        latestLog.isSuccess ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
                      }`}
                    >
                      {latestLog.isSuccess ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                    </span>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto bg-gray-900/40 border border-gray-700 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-300">
                      <th className="text-left py-3 px-4 font-medium">Timestamp</th>
                      <th className="text-left py-3 px-4 font-medium">Requester</th>
                      <th className="text-left py-3 px-4 font-medium">Resource</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Transaction Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessLogs.map((log, index) => (
                      <tr key={`${log.transactionHash}-${index}`} className="border-b border-gray-800 hover:bg-gray-800/60 transition-colors">
                        <td className="py-3 px-4 text-gray-300">{log.timestamp}</td>
                        <td className="py-3 px-4 font-mono text-blue-200">{log.requester}</td>
                        <td className="py-3 px-4 font-mono text-green-200">{log.resource}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              log.isSuccess ? 'bg-green-600/30 text-green-200' : 'bg-red-600/30 text-red-200'
                            }`}
                          >
                            {log.isSuccess ? 'Granted' : 'Denied'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-purple-200 text-xs">{log.transactionHash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p>BlockAuth IoT Access Control System</p>
          <p className="text-sm mt-2">Real-time blockchain monitoring and device management</p>
        </div>
      </div>
    </div>
  );
}

export default App;

