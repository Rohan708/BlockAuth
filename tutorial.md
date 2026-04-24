# 🚀 BlockAuth IoT Access Control System - Setup Tutorial

This tutorial will guide you through setting up and running the BlockAuth system, which provides blockchain-based access control for IoT devices.

## 📋 Prerequisites

Before starting, make sure you have:
- **Node.js** (version 16 or higher) installed
- **MetaMask** browser extension installed
- **Ganache** (local blockchain) running
- **Hardhat** project set up with deployed smart contract

## 🏗️ Project Structure

```
BlockAuth/
├── Backend/          # Node.js API server
├── Frontend/         # React web dashboard
├── Contracts/        # Smart contracts
├── Scripts/          # Simulation and utility scripts
└── .env              # Environment configuration
```

## 🔧 Step 1: Environment Setup

### 1.1 Create `.env` file in the root directory:

```bash
# Navigate to BlockAuth root directory
cd BlockAuth

# Create .env file
touch .env
```

### 1.2 Add the following environment variables to `.env`:

The backend reads **`ALCHEMY_API_URL`** as the JSON-RPC URL (you can point it at Ganache or any Ethereum node).

```env
# JSON-RPC endpoint (Ganache default is often 7545; match hardhat.config.js networks.ganache.url)
ALCHEMY_API_URL=http://127.0.0.1:7545

# Used by Hardhat to deploy (recommended). Same as SERVER_PRIVATE_KEY for local dev.
DEPLOYER_PRIVATE_KEY=0x...

# Must be the same wallet that deployed the contract — it is the on-chain "Admin"
SERVER_PRIVATE_KEY=0x...

# Output from deployment (see Step 1.3)
CONTRACT_ADDRESS=0x...

# Used by Scripts/run-simulation.js to fund device accounts (same as deployer/admin is simplest)
ADMIN_PRIVATE_KEY=0x...

PORT=5000
```

**Important**: Replace the placeholder values with your actual:
- RPC URL (must match the network where the contract is deployed, e.g. Ganache `http://127.0.0.1:7545`)
- **`SERVER_PRIVATE_KEY`**: private key of the contract deployer (constructor registers this address as `"Admin"`; only admins can register identities and grant access via the API)
- **`ADMIN_PRIVATE_KEY`**: for the simulation script; use the same key as the deployer unless you know you need a different funded account
- **`CONTRACT_ADDRESS`**: printed after you deploy (Step 1.3)

**Optional (frontend)**: create `Frontend/.env` if you want to override defaults:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ADMIN_ADDRESS=0xYourDeployerAddress
```

`REACT_APP_ADMIN_ADDRESS` should match the wallet that deployed the contract so the dashboard can treat that connected wallet as admin in the UI.

**💡 Pro Tip**: When your admin account runs low on ETH, fund it from another Ganache account or switch to a fresh Ganache workspace, redeploy, and update `CONTRACT_ADDRESS` and keys in `.env`.

### 1.3 Install root tooling and deploy the contract

From the **repository root** (where `hardhat.config.js` lives):

```bash
npm install
```

Start **Ganache** (or your node) so it matches `hardhat.config.js` — the sample `ganache` network uses `http://127.0.0.1:7545`.

Deploy:

```bash
npx hardhat run Scripts/deploy.js --network ganache
```

Copy the printed **contract address** into `CONTRACT_ADDRESS` in `.env`. Use the **same account’s private key** for `SERVER_PRIVATE_KEY` and `ADMIN_PRIVATE_KEY` if that account was the deployer.

## 🚀 Step 2: Start the Backend Server

### 2.1 Navigate to Backend directory:

```bash
cd BlockAuth/Backend
```

### 2.2 Install dependencies:

```bash
npm install
```

### 2.3 Start the backend server:

The backend does not define an `npm start` script; run Node directly:

```bash
node server.js
```

**Expected Output:**
```
[SERVER] Successfully loaded devices config: [ 'employeeFob', 'smartLock', 'securityCamera', 'dataServer', 'unauthorizedActor' ]
Successfully connected to blockchain and smart contract.
Server wallet address: 0x...
Smart contract address: 0x...
Server is running on http://localhost:5000
```

**✅ Backend is now running on http://localhost:5000**

## 🌐 Step 3: Start the Frontend Dashboard

### 3.1 Open a new terminal window/tab

### 3.2 Navigate to Frontend directory:

```bash
cd BlockAuth/Frontend
```

### 3.3 Install dependencies:

```bash
npm install
```

### 3.4 Start the React development server:

```bash
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view BlockAuth in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

**✅ Frontend is now running on http://localhost:3000**

## 🔗 Step 4: Connect MetaMask

### 4.1 Open your browser and go to `http://localhost:3000`

### 4.2 Click "Connect Wallet" button

### 4.3 MetaMask will pop up - click "Connect"

### 4.4 Your wallet address should now be displayed (truncated format)

## 🧪 Step 5: Test the System

### 5.1 Register a Device:
- Fill in the device registration form:
  - **Device Address**: Use any Ganache account address
  - **Device Name**: Enter any name (e.g., "Test Device")
  - **Device Role**: Enter any role (e.g., "Test_Role")
- Click "Register Device"
- You should see: "Device registered successfully! Transaction: 0x..."

### 5.2 View Access Logs:
- The access logs table will automatically refresh every 5 seconds
- Initially, it might show "Loading logs..." or be empty
- After running simulations, you'll see access attempts

## 🎮 Step 6: Run the Simulation (Optional)

### 6.1 Open a third terminal window/tab

### 6.2 From the repository root (so `hardhat` and paths resolve correctly):

```bash
cd BlockAuth
```

### 6.3 Run the simulation:

Ensure the **backend is already running** on port 5000. Then:

```bash
node Scripts/run-simulation.js
```

**Expected Output:**
```
[SETUP] Funding device accounts...
[SETUP] Registering entities...
[SETUP] Granting access permissions...
[CONTINUOUS] Starting continuous access simulation...
[CONTINUOUS] Employee Fob requesting access to Smart Lock...
[CONTINUOUS] Access granted: true
[CONTINUOUS] Security Camera requesting access to Data Server...
[CONTINUOUS] Access granted: true
[CONTINUOUS] Unauthorized Actor requesting access to Smart Lock...
[CONTINUOUS] Access granted: false
```

## 🚨 Troubleshooting

### Backend Issues:

**Error: "Failed to load devices config"**
```bash
# Check if device-config.js exists
ls BlockAuth/Scripts/device-config.js

# Backend loads config via require('../scripts/device-config.js') from Backend/server.js
# On case-sensitive filesystems the folder must be named consistently with that path
```

**Error: "Missing critical environment variables"**
```bash
# Check if .env file exists in the repo root and has correct values

# Required by Backend/server.js:
# ALCHEMY_API_URL, SERVER_PRIVATE_KEY, CONTRACT_ADDRESS
```

**Error: "Failed to initialize blockchain connection"**
```bash
# Check if Ganache (or your RPC node) is running
# Verify ALCHEMY_API_URL in .env matches the node's URL
# Ensure SERVER_PRIVATE_KEY is valid and CONTRACT_ADDRESS is deployed on that network
```

### Frontend Issues:

**Error: "Failed to register device"**
```bash
# Check if backend is running on port 5000
curl http://localhost:5000

# Should return: {"status":"ok","message":"API server is running."}
```

**Error: "npm start not found"**
```bash
# Make sure you're in the Frontend directory
pwd
# Should show: .../BlockAuth/Frontend

# Check if package.json exists
ls package.json
```

**CORS Errors:**
- The backend already has CORS configured
- If you still get CORS errors, restart both backend and frontend

## 📱 System Features

### Backend API Endpoints:
- `GET /` - Health check
- `POST /api/register` - Register new device/identity
- `POST /api/grant-access` - Grant access permissions
- `POST /api/request-access` - Process access requests
- `GET /api/access-logs` - Get access attempt logs

### Frontend Dashboard:
- **Wallet Connection**: Connect MetaMask wallet
- **Device Registration**: Register new IoT devices
- **Access Logs**: Real-time view of all access attempts
- **Dark Theme**: Modern, centered UI with Tailwind CSS

## 🔄 Restarting the System

### To restart everything:

1. **Stop all terminals** (Ctrl+C)
2. **Start Backend**: `cd Backend && node server.js`
3. **Start Frontend**: `cd Frontend && npm start` (in new terminal)
4. **Refresh browser** at `http://localhost:3000`

## 💰 Account Management & ETH Balance

### **Why ETH Balance Decreases:**
- Each blockchain transaction costs gas fees
- Backend operations (registering devices, granting access) consume ETH
- Account balance gradually decreases with usage

### **How to Switch Accounts:**
1. **Check Ganache** for accounts with sufficient ETH (100 ETH each)
2. **Copy private key** from a fresh account
3. **Update `.env` file**:
   ```env
   # Change this line in your .env file
   SERVER_PRIVATE_KEY=0xnew_private_key_here
   ```
4. **Restart backend** to use the new account

### **Account Rotation Strategy:**
- **Account 0**: Use until ~5 ETH remaining
- **Account 1**: Switch to when Account 0 is low
- **Account 2**: Use next, and so on...
- **Repeat** through all 10 Ganache accounts

### **Benefits of Account Rotation:**
- ✅ **Never run out of ETH** for testing
- ✅ **Fresh accounts** for each development phase
- ✅ **Easy to track** which account was used when
- ✅ **No need to restart Ganache** or redeploy contracts

## 🎯 What You Should See

### Successful Setup:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ MetaMask wallet connected
- ✅ Device registration working
- ✅ Access logs updating in real-time

### Access Control Logic:
- **Employee Fob → Smart Lock**: ✅ Access Granted
- **Security Camera → Data Server**: ✅ Access Granted  
- **Unauthorized Actor → Any Resource**: ❌ Access Denied

## 🎉 Congratulations!

You now have a fully functional blockchain-based IoT access control system running locally! The system demonstrates:

- **Real-time access control** using smart contracts
- **Immutable audit logs** on the blockchain
- **Role-based permissions** for IoT devices
- **Web dashboard** for monitoring and management
- **MetaMask integration** for wallet connectivity

## 🔗 Useful Links

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Ganache**: http://127.0.0.1:7545
- **Smart Contract**: Check your .env for CONTRACT_ADDRESS

---

**Need Help?** Check the troubleshooting section above or review the console outputs for specific error messages.
