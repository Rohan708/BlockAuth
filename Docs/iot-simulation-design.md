Simulated IoT Device & Environment Design
This document outlines the design for the simulated IoT devices and the environment they operate in. This will guide the creation of the device simulation scripts in a later phase.

1. The Simulated Environment: "Smart Office"
To make the simulation concrete, we will model a simple "Smart Office" environment. This environment contains several interconnected devices that need to interact securely.

2. The Simulated Entities & Their Roles
We will create software scripts to represent the following entities. Each will have a unique Ethereum address on the Ganache test network.

Admin User:

Role: Admin

Description: Represents the office manager who has full control over the system. They will use the Web Dashboard to register devices and manage permissions.

Device 1: Main Entrance Smart Lock

Role: Device_Lock

Description: A smart lock on the office's front door. It doesn't request access itself but acts as a resource that other entities request access to.

Device 2: Lobby Security Camera

Role: Device_Camera

Description: A security camera that records video and needs permission to store its footage.

Device 3: Secure Data Server

Role: Device_Server

Description: A server where data, like camera footage, is stored. It acts as a protected resource.

User 1: Employee Fob

Role: User_Employee

Description: Represents an employee's access key fob or smartphone, which needs permission to unlock the main door.

3. Simulated Device Behavior & API Interaction
The simulation scripts will run in a loop, performing actions at set intervals to mimic real-world behavior.

Employee Fob (Simulated Behavior):

Action: Attempt to unlock the Main Entrance Smart Lock.

Frequency: Every 60 seconds.

API Call: The script will send a POST request to the /api/request-access endpoint.

Request Body:

{
  "requesterAddress": "[Employee_Fob_Address]",
  "resourceAddress": "[Smart_Lock_Address]"
}

Lobby Security Camera (Simulated Behavior):

Action: Attempt to store footage on the Secure Data Server.

Frequency: Every 30 seconds.

API Call: The script will send a POST request to the /api/request-access endpoint.

Request Body:

{
  "requesterAddress": "[Security_Camera_Address]",
  "resourceAddress": "[Data_Server_Address]"
}

Unauthorized Actor (Simulated Behavior):

Action: We will also create a script for an unregistered device that attempts to access resources to test the system's security.

Frequency: Every 90 seconds.

API Call: The script will send a POST request to /api/request-access.

Request Body:

{
  "requesterAddress": "[Unauthorized_Address]",
  "resourceAddress": "[Data_Server_Address]"
}

Expected Outcome: This request should always be denied by the smart contract and logged as a failed attempt.