// This file contains the configuration for our simulated IoT devices.
// We will get these addresses and private keys from our local Ganache instance.

const devices = {
  // The Admin User is the account that deployed the contract (Account 0 in Ganache)
  // We don't need its private key here as the server handles admin tasks.

  smartLock: {
    name: "Main Entrance Smart Lock",
    role: "Device_Lock",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
  },
  securityCamera: {
    name: "Lobby Security Camera",
    role: "Device_Camera",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
  },
  dataServer: {
    name: "Secure Data Server",
    role: "Device_Server",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
  },
  employeeFob: {
    name: "Employee Fob",
    role: "User_Employee",
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    privateKey: "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
  },
  unauthorizedActor: {
    name: "Unauthorized Actor",
    role: "Guest", // This role won't be given any permissions
    address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    privateKey: "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba"
  }
};

module.exports = devices;
