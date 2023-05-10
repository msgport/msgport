const hre = require("hardhat");

async function deployMsgport(network) {
  hre.changeNetwork(network);
  const DefaultMsgport = await hre.ethers.getContractFactory("DefaultMsgport");
  const msgport = await DefaultMsgport.deploy();
  await msgport.deployed();
  console.log(`${network} msgport: ${msgport.address}`);
}

async function deployDock(network, msgportAddress, dockName, dockArgs) {
  hre.changeNetwork(network);
  let Dock = await hre.ethers.getContractFactory(dockName);
  let dock = await Dock.deploy(...dockArgs);
  await dock.deployed();
  console.log(`${network} ${dockName} dock: ${dock.address}`);

  // Add it to the msgport
  let DefaultMsgport = await hre.ethers.getContractFactory("DefaultMsgport");
  const msgport = await DefaultMsgport.attach(msgportAddress);
  await (await msgport.setDock(dock.address)).wait();
  console.log(
    ` ${network} dock ${dock.address} set on msgport ${msgportAddress}`
  );

  return dock.address;
}

async function setRemoteDock(network, dockAddress, remoteDockAddress) {
  hre.changeNetwork(network);
  let Dock = await hre.ethers.getContractFactory("DarwiniaS2sDock");
  let dock = await Dock.attach(dockAddress);
  await (await dock.setRemoteDockAddress(remoteDockAddress)).wait();
  console.log(
    `${network} dock ${dockAddress} set remote dock ${remoteDockAddress}`
  );
}

async function getMsgport(network, msgportAddress) {
  return {
    send: async (toDappAddress, messagePayload, estimateFee) => {
      hre.changeNetwork(network);
      const DefaultMsgport = await hre.ethers.getContractFactory(
        "DefaultMsgport"
      );
      const msgport = await DefaultMsgport.attach(msgportAddress);

      // Estimate fee
      const fromDappAddress = (await hre.ethers.getSigner()).address;
      const fee = await estimateFee(
        fromDappAddress,
        toDappAddress,
        messagePayload
      );
      console.log(`cross-chain fee: ${fee} wei.`);

      // Send message
      const tx = await msgport.send(toDappAddress, messagePayload, fee, {
        value: fee,
      });
      console.log(
        `message ${messagePayload} sent to ${toDappAddress} through ${network} msgport ${msgportAddress}`
      );
      console.log(
        `https://pangoro.subscan.io/extrinsic/${
          (await tx.wait()).transactionHash
        }`
      );
    },
  };
}

exports.deployMsgport = deployMsgport;
exports.deployDock = deployDock;
exports.setRemoteDock = setRemoteDock;
exports.getMsgport = getMsgport;