import { ethers } from 'hardhat';

async function main() {
  const Forwarder = await ethers.getContractFactory('Forwarder');
  const forwarder = await Forwarder.deploy();
  await forwarder.deployed();

  console.log(`Forwarder deployed to ${forwarder.address}`);

  for (let tokenName of ['Token1', 'Token2', 'Token3']) {
    const Token = await ethers.getContractFactory(tokenName);
    const token = await Token.deploy();
    await token.deployed();

    await forwarder.whitelistToken(token.address);

    console.log(`${tokenName} whitelisted and deployed to ${token.address}`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
