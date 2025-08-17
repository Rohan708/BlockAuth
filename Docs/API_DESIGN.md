Backend API Design for Access Control System
This document outlines the API endpoints for the server that interacts with the AccessControlContract.

1. Register a New Identity
This endpoint allows an admin to register a new user or device on the blockchain.

Endpoint: POST /api/register

Description: Calls the registerIdentity function on the smart contract. This action requires an admin's signature and will be initiated from the frontend dashboard.

Request Body:

{
  "newAddress": "0x...",
  "name": "Living Room Camera",
  "role": "Device_Camera"
}

Success Response (200 OK):

{
  "success": true,
  "message": "Identity registered successfully.",
  "transactionHash": "0x..."
}

Error Response (400/500):

{
  "success": false,
  "message": "Error: Address is already registered."
}

2. Grant Access Permission
This endpoint allows an admin to grant an entity permission to access a resource.

Endpoint: POST /api/grant-access

Description: Calls the grantAccess function on the smart contract.

Request Body:

{
  "requester": "0x...",
  "resource": "0x..."
}

Success Response (200 OK):

{
  "success": true,
  "message": "Access granted successfully.",
  "transactionHash": "0x..."
}

Error Response (400/500):

{
  "success": false,
  "message": "Error: Requester is not a registered identity."
}

3. Revoke Access Permission
This endpoint allows an admin to revoke an entity's permission to access a resource.

Endpoint: POST /api/revoke-access

Description: Calls the revokeAccess function on the smart contract.

Request Body:

{
  "requester": "0x...",
  "resource": "0x..."
}

Success Response (200 OK):

{
  "success": true,
  "message": "Access revoked successfully.",
  "transactionHash": "0x..."
}

Error Response (400/500):

{
  "success": false,
  "message": "An error occurred."
}

4. Request Access (from a Device)
This endpoint will be called by your simulated IoT device scripts to request access to a resource.

Endpoint: POST /api/request-access

Description: Calls the requestAccess function from the perspective of the device making the call. The backend will need to manage the device's private key to sign this transaction.

Request Body:

{
  "requesterAddress": "0x...", // The address of the device making the request
  "resourceAddress": "0x..."  // The resource it wants to access
}

Success Response (200 OK):

{
  "success": true,
  "accessGranted": true, // or false
  "message": "Access was granted." // or "Access was denied."
}

Error Response (400/500):

{
  "success": false,
  "message": "Error processing request."
}

5. Get All Access Logs
This endpoint allows the frontend dashboard to fetch the history of all access attempts.

Endpoint: GET /api/access-logs

Description: Fetches and decodes all AccessAttempt events from the smart contract.

Request Body: None

Success Response (200 OK):

{
  "success": true,
  "logs": [
    {
      "requester": "0x...",
      "resource": "0x...",
      "isSuccess": true,
      "timestamp": 1672531200
    },
    {
      "requester": "0x...",
      "resource": "0x...",
      "isSuccess": false,
      "timestamp": 1672531260
    }
  ]
}

Error Response (500):

{
  "success": false,
  "message": "Failed to fetch logs."
}
