require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.20",
  networks: {
    // Ganache desktop default RPC (start Ganache first, or use "localhost" below)
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : []
    },
    // Run in another terminal: npx hardhat node  — then deploy with --network localhost
    localhost: {
      url: "http://127.0.0.1:8545",
      // Hardhat node uses public test keys; override with DEPLOYER_PRIVATE_KEY if you want.
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : []
    }
  }
};
