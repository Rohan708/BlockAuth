System Architecture & Data Flow Diagrams
This document provides the final visual blueprint for the project, outlining the overall architecture and the step-by-step flow of data for key operations.

1. Final System Architecture
The system is designed with four distinct software layers that communicate in a structured way.

+-------------------------------------------------------------------------+
|                          FRONTEND LAYER                                 |
|                  (Admin's Browser on Laptop/Phone)                      |
|                                                                         |
|   +---------------------+        +----------------------------------+   |
|   |   Web Dashboard     |        |          MetaMask Wallet         |   |
|   |   (React.js)        |<------>| (Browser Extension for Signing)  |   |
|   +---------------------+        +----------------------------------+   |
|             |                                                           |
+-------------|-----------------------------------------------------------+
              | (HTTP API Calls to /register, /grant-access, /get-logs)
              |
+-------------|-----------------------------------------------------------+
|             ▼                                                           |
|                          BACKEND LAYER                                  |
|                         (Node.js Server)                                |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                API Server (Express.js)                          |   |
|   |   - Manages business logic                                      |   |
|   |   - Uses Web3.js to talk to the blockchain                      |   |
|   +-----------------------------------------------------------------+   |
|             |                         ▲                                 |
+-------------|-------------------------|---------------------------------+
              | (Blockchain RPC Calls)  | (HTTP API Call to /request-access)
              |                         |
+-------------|-------------------------|---------------------------------+
|             ▼                         |                                 |
|                        BLOCKCHAIN LAYER                                 |
|                     (Local Ganache Network)                             |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                AccessControlContract.sol                        |   |
|   |   - Identity Registry (mapping)                                 |   |
|   |   - Access Permissions (mapping)                                |   |
|   |   - Emits AccessAttempt events                                  |   |
|   +-----------------------------------------------------------------+   |
|                                                                         |
+-------------------------------------------------------------------------+
                                      |
+-------------------------------------|-----------------------------------+
|                                     ▼                                   |
|                      SIMULATED IOT LAYER                                |
|                        (Scripts on Laptop)                              |
|                                                                         |
|   +----------------------+  +-----------------------+  +-------------+  |
|   | Employee Fob Script  |  | Security Camera Script|  | Unauthorized|  |
|   | (Node.js/Python)     |  | (Node.js/Python)      |  | Actor Script|  |
|   +----------------------+  +-----------------------+  +-------------+  |
|                                                                         |
+-------------------------------------------------------------------------+


2. Data Flow Diagrams
Workflow 1: Registering a New Device
This flow shows how an Admin adds a new trusted device to the system.

Admin UI

The Admin enters the new device's details (address, name, role) into the Web Dashboard.

Frontend → MetaMask

The Dashboard creates a transaction to call the registerIdentity function and sends it to MetaMask.

MetaMask

MetaMask prompts the Admin to review and sign the transaction with their private key.

Frontend → Backend

The signed transaction is sent via an HTTP call to the POST /api/register endpoint on the Backend Server.

Backend → Blockchain

The Backend Server uses Web3.js to broadcast the signed transaction to the Ganache Blockchain.

Blockchain

The AccessControlContract executes the registerIdentity function, updates its state, and emits an IdentityRegistered event.

Confirmation

The transaction is confirmed, and the Backend sends a success response back to the Frontend, which updates the UI.

Workflow 2: Device Requesting Access
This flow shows how a simulated device attempts to access a resource.

Simulated IoT Device

A Simulated Device Script (e.g., the Security Camera) initiates an action.

Simulated Device → Backend

The script sends an HTTP call to the POST /api/request-access endpoint on the Backend Server, including its own address and the target resource's address.

Backend → Blockchain

The Backend Server uses its credentials to sign and send a transaction to the Ganache Blockchain, calling the requestAccess function on the AccessControlContract.

Blockchain

The smart contract checks its accessPermissions mapping to verify if the requester has permission.

It emits an AccessAttempt event with the result (success or failure).

Blockchain → Backend

The contract returns true or false to the Backend Server.

Backend → Simulated Device

The Backend sends a final "Allow" or "Deny" response back to the Simulated Device Script.

Frontend (Monitoring)

Separately, the Web Dashboard can poll the GET /api/access-logs endpoint, which fetches the new AccessAttempt event from the blockchain and displays it in the log viewer.