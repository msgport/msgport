import { ethers } from "ethers";
import { IEstimateFee } from "./interfaces/IEstimateFee";
import { layerzero } from "./layerzero/index";
import { axelar } from "./axelar/index";
import BaseMessageDockContract from "../artifacts/contracts/interfaces/BaseMessageDock.sol/BaseMessageDock.json";
import { IDock } from "./interfaces/IDock";

enum DockType {
  Axelar = 0,
  AxelarTestnet = 1,
  Celer = 2,
  Darwinia = 3,
  DarwiniaS2S = 4,
  DarwiniaXcmp = 5,
  LayerZero = 6,
}

async function getDock(
  provider: ethers.providers.Provider,
  dockAddress: string,
  dockType: DockType
) {
  const dock = new ethers.Contract(
    dockAddress,
    BaseMessageDockContract.abi,
    provider
  );

  let estimateFee: IEstimateFee = await buildEstimateFunction(
    provider,
    dockType,
    dockAddress
  );

  const result: IDock = {
    address: dockAddress,

    getLocalChainId: async () => {
      return await dock.getLocalChainId();
    },

    getRemoteDockAddress: async (remoteChainId: number) => {
      return await dock.remoteDockAddresses(remoteChainId);
    },

    estimateFee: async (
      remoteChainId: number,
      messagePayload: string,
      feeMultiplier: number
    ) => {
      console.log(`Estimating fee for message payload: ${messagePayload}`);
      const remoteDockAddress = await dock.remoteDockAddresses(remoteChainId);

      console.log(`remoteDockAddress: ${remoteDockAddress}`);
      return await estimateFee(
        await dock.getLocalChainId(),
        dockAddress,
        remoteChainId,
        remoteDockAddress,
        messagePayload,
        feeMultiplier
      );
    },
  };

  return result;
}

async function buildEstimateFunction(
  provider: ethers.providers.Provider,
  dockType: DockType,
  dockAddress: string
) {
  let estimateFee: IEstimateFee;
  if (dockType == DockType.LayerZero) {
    estimateFee = await layerzero.buildEstimateFeeFunction(
      provider,
      dockAddress
    );
  } else if (dockType == DockType.Axelar) {
    estimateFee = await axelar.buildEstimateFeeFunction(
      provider,
      dockAddress,
      axelar.Environment.MAINNET
    );
  } else if (dockType == DockType.AxelarTestnet) {
    estimateFee = await axelar.buildEstimateFeeFunction(
      provider,
      dockAddress,
      axelar.Environment.TESTNET
    );
  } else {
    throw new Error("Unsupported dock type");
  }
  return estimateFee;
}

export { getDock, DockType };
