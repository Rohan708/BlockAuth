// Import necessary libraries
require('dotenv').config({ path: '../.env' });
const express = require('express');
const { ethers } = require('ethers');

// --- Configuration ---
const PORT = process.env.PORT || 5000;
const GANACHE_URL = process.env.GANACHE_URL;
const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// --- Contract ABI ---
const contractABI = [ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "requester", "type": "address" }, { "indexed": true, "internalType": "address", "name": "resource", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "isSuccess", "type": "bool" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" } ], "name": "AccessAttempt", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "entityAddress", "type": "address" }, { "indexed": false, "internalType": "string", "name": "role", "type": "string" } ], "name": "IdentityRegistered", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" } ], "name": "accessPermissions", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_requester", "type": "address" }, { "internalType": "address", "name": "_resource", "type": "address" } ], "name": "grantAccess", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "identityRegistry", "outputs": [ { "internalType": "address", "name": "walletAddress", "type": "address" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "role", "type": "string" }, { "internalType": "bool", "name": "isRegistered", "type": "bool" }, { "internalType": "uint256", "name": "registrationDate", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_newAddress", "type": "address" }, { "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "string", "name": "_role", "type": "string" } ], "name": "registerIdentity", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_resource", "type": "address" } ], "name": "requestAccess", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_requester", "type": "address" }, { "internalType": "address", "name": "_resource", "type": "address" } ], "name": "revokeAccess", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ];

// --- Global Variables ---
let provider;
let serverWallet;
let contract;

// --- Server Setup ---
const app = express();
app.use(express.json());

async function init() {
  try {
    if (!GANACHE_URL || !SERVER_PRIVATE_KEY || !CONTRACT_ADDRESS) {
        throw new Error("Missing critical environment variables. Check your .env file.");
    }
    provider = new ethers.JsonRpcProvider(GANACHE_URL);
    serverWallet = new ethers.Wallet(SERVER_PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, serverWallet);
    console.log("Successfully connected to Ganache and smart contract.");
    console.log(`Server wallet address: ${serverWallet.address}`);
    console.log(`Smart contract address: ${await contract.getAddress()}`);
  } catch (error) {
    console.error("Failed to initialize blockchain connection:", error);
    process.exit(1);
  }
}

// --- API Endpoints ---

app.get('/', (req, res) => {
    res.status(200).json({ status: "ok", message: "API server is running." });
});

// Admin-only endpoints (use the server's wallet)
app.post('/api/register', async (req, res) => {
  try {
    const { newAddress, name, role } = req.body;
    if (!newAddress || !name || !role) return res.status(400).json({ success: false, message: "Missing required fields." });
    console.log(`[API] Registering ${name} (${newAddress}) with role ${role}...`);
    const tx = await contract.registerIdentity(newAddress, name, role);
    await tx.wait();
    res.status(200).json({ success: true, message: `Identity for ${name} registered.`, txHash: tx.hash });
  } catch (error) {
    console.error("[API ERROR /register]", error.reason || error.message);
    res.status(500).json({ success: false, message: "Error: Registration failed.", error: error.reason || error.message });
  }
});

app.post('/api/grant-access', async (req, res) => {
    try {
        const { requester, resource } = req.body;
        if (!requester || !resource) return res.status(400).json({ success: false, message: "Missing required fields." });
        console.log(`[API] Granting access from ${requester} to ${resource}...`);
        const tx = await contract.grantAccess(requester, resource);
        await tx.wait();
        res.status(200).json({ success: true, message: "Access granted.", txHash: tx.hash });
    } catch (error) {
        console.error("[API ERROR /grant-access]", error.reason || error.message);
        res.status(500).json({ success: false, message: "Error: Granting access failed.", error: error.reason || error.message });
    }
});

// Device-specific endpoint
app.post('/api/request-access', async (req, res) => {
    try {
        const { requesterAddress, resourceAddress } = req.body;
        if (!requesterAddress || !resourceAddress) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        // The server's admin wallet will pay the gas fee.
        // We will call a "view" function first to check permission without a transaction.
        const hasPermission = await contract.accessPermissions(requesterAddress, resourceAddress);

        // Now, we send a transaction to LOG the attempt.
        // We need to connect the contract to a wallet representing the device to do this.
        const deviceSigner = await provider.getSigner(requesterAddress);
        const contractAsDevice = contract.connect(deviceSigner);
        
        console.log(`[API] Processing access request from ${requesterAddress} for ${resourceAddress}...`);
        
        // This transaction's only job is to log the event.
        const tx = await contractAsDevice.requestAccess(resourceAddress);
        await tx.wait();

        res.status(200).json({ success: true, accessGranted: hasPermission });

    } catch (error) {
        console.error("[API ERROR /request-access]", error.reason || error.message);
        res.status(500).json({ success: false, accessGranted: false, message: "Access denied due to an error." });
    }
});


app.get('/api/access-logs', async (req, res) => {
    try {
        const filter = contract.filters.AccessAttempt();
        const logs = await contract.queryFilter(filter, 0, 'latest');
        const formattedLogs = logs.map(log => ({
            requester: log.args.requester,
            resource: log.args.resource,
            isSuccess: log.args.isSuccess,
            timestamp: new Date(Number(log.args.timestamp) * 1000).toLocaleString(),
            transactionHash: log.transactionHash
        }));
        res.status(200).json({ success: true, logs: formattedLogs });
    } catch (error) {
        console.error("[API ERROR /access-logs]", error.reason || error.message);
        res.status(500).json({ success: false, message: "Failed to fetch logs." });
    }
});


// --- Start Server ---
init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
