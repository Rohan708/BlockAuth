require('dotenv').config(); // Load .env file from the root project folder
const { postRequest } = require('./utils');
const devices = require('./device-config');
const hre = require("hardhat");

// A simple delay function
const delay = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * This function sets up the initial state of our simulation.
 * It funds the device accounts, registers them, and grants permissions.
 */
async function setupSimulation() {
  console.log("--- Starting Simulation Setup ---");

  // Get the provider from Hardhat
  const provider = hre.ethers.provider;

  // Create a wallet instance for the admin using the private key from the .env file
  const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
  if (!adminPrivateKey || !adminPrivateKey.startsWith('0x')) {
      throw new Error("The ADMIN_PRIVATE_KEY in your .env file is invalid or missing.");
  }
  const adminWallet = new hre.ethers.Wallet(adminPrivateKey, provider);
  console.log(`\n[SETUP] Using admin account: ${adminWallet.address}`);

  // 1. Fund all the device accounts so they can pay for gas fees.
  console.log("\n[SETUP] Funding device accounts...");
  for (const deviceKey in devices) {
    const device = devices[deviceKey];
    console.log(`> Sending 1.0 ETH to ${device.name} (${device.address})...`);
    const tx = await adminWallet.sendTransaction({
      to: device.address,
      value: hre.ethers.parseEther("1.0") // Send 1.0 ETH to each device
    });
    await tx.wait();
    console.log(`> Transaction successful.`);
  }

  // 2. Register all our devices and users via the API.
  console.log("\n[SETUP] Registering all entities via API...");
  for (const deviceKey in devices) {
    const device = devices[deviceKey];
    const body = {
      newAddress: device.address,
      name: device.name,
      role: device.role,
    };
    const response = await postRequest('/register', body);
    console.log(`> Registering ${device.name}: ${response.message}`);
    await delay(500); // Wait 0.5 seconds between requests
  }

  // 3. Grant specific permissions based on our design.
  console.log("\n[SETUP] Granting access permissions via API...");

  // Grant Employee Fob access to the Smart Lock
  let grantBody = {
    requester: devices.employeeFob.address,
    resource: devices.smartLock.address,
  };
  let response = await postRequest('/grant-access', grantBody);
  console.log(`> Granting Employee Fob access to Smart Lock: ${response.message}`);
  await delay(500);

  // Grant Security Camera access to the Data Server
  grantBody = {
    requester: devices.securityCamera.address,
    resource: devices.dataServer.address,
  };
  response = await postRequest('/grant-access', grantBody);
  console.log(`> Granting Security Camera access to Data Server: ${response.message}`);
  
  console.log("\n--- Simulation Setup Complete ---");
}

/**
 * This function runs the continuous simulation of device interactions.
 */
function runContinuousSimulation() {
    console.log("\n--- Starting Continuous Device Simulation ---");
    console.log("(Press CTRL+C to stop the simulation)\n");

    // Simulate Employee Fob trying to unlock the door every 15 seconds
    setInterval(async () => {
        const body = {
            requesterAddress: devices.employeeFob.address,
            resourceAddress: devices.smartLock.address,
        };
        const response = await postRequest('/request-access', body);
        console.log(`[EVENT] Employee Fob attempts to unlock door... Access Granted: ${response.accessGranted}`);
    }, 15000); // 15 seconds

    // Simulate Security Camera trying to store data every 10 seconds
    setInterval(async () => {
        const body = {
            requesterAddress: devices.securityCamera.address,
            resourceAddress: devices.dataServer.address,
        };
        const response = await postRequest('/request-access', body);
        console.log(`[EVENT] Security Camera attempts to store data... Access Granted: ${response.accessGranted}`);
    }, 10000); // 10 seconds

    // Simulate Unauthorized Actor trying to access the server every 20 seconds
    setInterval(async () => {
        const body = {
            requesterAddress: devices.unauthorizedActor.address,
            resourceAddress: devices.dataServer.address,
        };
        const response = await postRequest('/request-access', body);
        console.log(`[EVENT] Unauthorized Actor attempts to access server... Access Granted: ${response.accessGranted}`);
    }, 20000); // 20 seconds
}


async function main() {
  await setupSimulation();
  runContinuousSimulation();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
