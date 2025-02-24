import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { SuiGraphQLClient } from "@mysten/sui/graphql";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      packageID:
        "0xa7ee778a8c7e656adcd03db015c6fe4488276cf614c07989766e636c13286039",
      userProfilePortal:
        "0x2ef24b51a85c8d9e30a68ff1a2e0488d556dbabb53ffe9cfabf9656abc42bf87",
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      packageID:
        "0xd3a2cb3f1df0cd8ce4570d1fb122f10ce68434a95304830dca86d0711f2c597a",
      userProfilePortal:
        "0x5f11507ec60701ca8f704fd0f54dbd5e4301cb1be735c4cb025977fab50dae93",
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
    },
  });

const suiClient = new SuiClient({
  url: networkConfig.devnet.url,
});

const suiGraphQLClient = new SuiGraphQLClient({
  url: `https://sui-devnet.mystenlabs.com/graphql`,
});

export { useNetworkVariable, useNetworkVariables, networkConfig, suiClient, suiGraphQLClient };
