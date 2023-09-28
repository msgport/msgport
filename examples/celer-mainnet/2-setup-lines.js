const { setupLines } = require("../helper");

async function main() {
  const senderChain = "fantom";
  const senderLineRegistryAddress = "0x7bB47867d8BA255c79e6f5BaCAC6e3194D05C273"; // <---- This is the sender lineRegistry address from 1-setup-lineRegistrys.js
  const senderLineName = "CelerLine";
  const senderLineParams = [
    "0xFF4E183a0Ceb4Fa98E63BbF8077B929c8E5A2bA4", // senderMessageBus
    250, // senderChainId
    56, // receiverChainId
  ];

  const receiverChain = "bnbChain";
  const receiverLineRegistryAddress = "0x770497281303Cdb2e0252B82AdEEA1d61896dD43"; // <---- This is the receiver lineRegistry address from 1-setup-lineRegistrys.js
  const receiverLineName = "CelerLine";
  const receiverLineParams = [
    "0x95714818fdd7a5454f73da9c777b3ee6ebaeea6b", // receiverMessageBus
    56, // senderChainId
    250, // receiverChainId
  ];

  await setupLines(
    senderChain,
    senderLineRegistryAddress,
    senderLineName,
    senderLineParams,
    receiverChain,
    receiverLineRegistryAddress,
    receiverLineName,
    receiverLineParams
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
