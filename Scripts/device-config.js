// This file contains the configuration for our simulated IoT devices.
// We will get these addresses and private keys from our local Ganache instance.

const devices = {
  // The Admin User is the account that deployed the contract (Account 0 in Ganache)
  // We don't need its private key here as the server handles admin tasks.

  smartLock: {
    name: "Main Entrance Smart Lock",
    role: "Device_Lock",
    address: "0x6F93aa46273567EF188b76f50366f4E38598f88F",
    privateKey: "0xbc853abd02fb8f531ec0bf3666894d325761630339759ad1c5375a58360d7582"
  },
  securityCamera: {
    name: "Lobby Security Camera",
    role: "Device_Camera",
    address: "0x5Af7d060A864fdbeDe900A709a34f57eAE8FbAAE",
    privateKey: "0x01c8e3f3464f5311749a90f73274d2b41d4dd729aff311f6982a38ea20b0531f"
  },
  dataServer: {
    name: "Secure Data Server",
    role: "Device_Server",
    address: "0x29FA168772FA6ED3b65Cd42CacFa00316297a949",
    privateKey: "0x06fb17282a9732e1e71329ccdeb02cb3872e12cc323dfebe4d206dfb37e3d2f5"
  },
  employeeFob: {
    name: "Employee Fob",
    role: "User_Employee",
    address: "0x1C00B42fDeb1fe0F7b10c7c444645133423de484",
    privateKey: "0xb4995abb252f116ae92c45e4da1dc73e40c49babc9f60389590dceb2a69aa60c"
  },
  unauthorizedActor: {
    name: "Unauthorized Actor",
    role: "Guest", // This role won't be given any permissions
    address: "0x22Cd0A86960851ff5F150ad3D504ccCdcE6F4777",
    privateKey: "0x2ea6252aed1137356bb31880402bd87b2b5665177238fbaa0052b5c8c40e0876"
  }
};

module.exports = devices;
