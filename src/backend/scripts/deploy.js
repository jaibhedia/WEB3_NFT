const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Get the ContractFactories and Signers here.
  const NFT = await ethers.getContractFactory("NFT");
  const Marketplace = await ethers.getContractFactory("Marketplace");

  // Deploy contracts
  const marketplace = await Marketplace.deploy(1);
  const nft = await NFT.deploy();

  console.log("NFT Contact Address", nft.address);
  console.log("Marketplace Contact Address", marketplace.address);

  // Save copies of each contract's abi and address to the frontend.
  saveFrontendFiles(marketplace, "Marketplace");
  saveFrontendFiles(nft, "NFT");
}

async function saveFrontendFiles(contract, name) {
  const contractsDir = path.join(__dirname, "/../../frontend/contractsData");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const addressFilePath = path.join(contractsDir, `${name}-address.json`);
  const abiFilePath = path.join(contractsDir, `${name}.json`);

  // Check if files already exist
  if (fs.existsSync(addressFilePath) || fs.existsSync(abiFilePath)) {
    const overwriteConfirmation = await confirmOverwrite();
    if (!overwriteConfirmation) {
      console.log("Files not overwritten. Exiting...");
      return;
    }
  }

  // Write contract address to file
  fs.writeFileSync(
    addressFilePath,
    JSON.stringify({ address: contract.address }, null, 2)
  );

  // Write contract ABI to file
  const contractArtifact = await ethers.getContractAt(name, contract.address);
  fs.writeFileSync(
    abiFilePath,
    JSON.stringify(contractArtifact.interface, null, 2)
  );

  console.log(`Files for ${name} written successfully.`);
}

async function confirmOverwrite() {
  return new Promise((resolve) => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question(
      "Contract data files already exist. Do you want to overwrite? (yes/no): ",
      (answer) => {
        readline.close();
        resolve(answer.toLowerCase() === "yes");
      }
    );
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
