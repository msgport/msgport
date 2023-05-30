const { deployReceiver } = require("../helper");
const hre = require("hardhat");
const {
  getMsgport,
  createDefaultDockSelectionStrategy,
} = require("../../dist/src/index");
const { DockType } = require("../../dist/src/dock")

async function main() {
  const senderChain = "fantomTestnet";
  const receiverChain = "moonbaseAlpha";

  ///////////////////////////////////////
  // deploy receiver
  ///////////////////////////////////////
  hre.changeNetwork(receiverChain);
  const receiverAddress = "0x8205b173786DC663d328D1CD9AdBCCb3877aBC6E";
  // await deployReceiver(receiverChain);
  const receiverChainId = (await hre.ethers.provider.getNetwork())["chainId"];
  console.log(
    `On ${receiverChain}, chain id: ${receiverChainId}, receiver address: ${receiverAddress}`
  );

  ///////////////////////////////////////
  // send message to receiver
  ///////////////////////////////////////
  hre.changeNetwork(senderChain);
  //  1. get msgport
  const msgport = await getMsgport(
    await hre.ethers.getSigner(),
    "0x0B9325BBc7F5Be9cA45bB9A8B5C74EaB97788adF" // <------- change this, see 0-setup-msgports.js
  );

  //  2. get the dock selection strategy
  const selectLastDock = async (_) =>
    // !! Make sure it's in the dockTypeRegistry
    "0xE5119671d15AF42e3665c4d656d44996D7136144"; // <------- change this, see 2-setup-docks.js

  //  3. send message
  // https://layerzero.gitbook.io/docs/evm-guides/advanced/relayer-adapter-parameters
  let params = hre.ethers.utils.solidityPack(
    ["uint16", "uint256"],
    [1, 1000000]
  );
  const tx = await msgport.send(
    receiverChainId,
    selectLastDock,
    receiverAddress,
    "0x12345678",
    1.1,
    params
  );

  console.log(
    `Message sent: https://testnet.layerzeroscan.com/tx/${(await tx.wait()).transactionHash
    }`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
