import { AptosConfig, Network } from "@aptos-labs/ts-sdk";

export const config = new AptosConfig({
  network: Network.TESTNET,
  fullnode: 'https://aptos.testnet.porto.movementlabs.xyz/v1',
  faucet: 'https://fund.testnet.porto.movementlabs.xyz/'
});
