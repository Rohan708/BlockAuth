// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy.
  // This line uses ethers.js to create a "ContractFactory" for our specific contract.
  // A ContractFactory is an abstraction used to deploy new smart contracts.
  const AccessControlContract = await hre.ethers.getContractFactory("AccessControlContract");

  // We call the deploy() function on the factory to start the deployment process.
  // This sends the transaction to the network and returns a promise that resolves
  // to a contract object.
  console.log("Deploying AccessControlContract...");
  const accessControl = await AccessControlContract.deploy();

  // We wait for the deployment transaction to be mined and confirmed on the blockchain.
  await accessControl.waitForDeployment();
  
  // Once deployed, the contract will have a unique address on the blockchain.
  // We print this address to the console so we know where to find it.
  const contractAddress = await accessControl.getAddress();
  console.log("AccessControlContract deployed to:", contractAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
