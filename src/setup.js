// File: setup.js

import { connectSdk } from "./utils/connect-sdk.js";
import { writeFile } from 'fs/promises';

const setup = async () => {
  const { account, sdk } = await connectSdk();

  console.log(`Setting up Fantasy F1 game with account: ${account.address}`);

  // 1. Create Players Collection
  const playersCollection = await sdk.collection.createV2({
    name: "Fantasy F1 Players",
    description: "Player profiles for Fantasy Formula 1 game",
    symbol: "F1P",
    permissions: { nesting: { collectionAdmin: true } },
    encodeOptions: {
      defaultPermission: { collectionAdmin: true, tokenOwner: false, mutable: true },
    },
  });

  console.log(`Players Collection created with ID: ${playersCollection.parsed.collectionId}`);

  // 2. Create Achievements Collection
  const achievementsCollection = await sdk.collection.createV2({
    name: "F1 Predictions Achievements",
    description: "Achievements for correct predictions in Fantasy F1 game",
    symbol: "F1A",
    permissions: { nesting: { collectionAdmin: true } },
    encodeOptions: {
      defaultPermission: { collectionAdmin: true, tokenOwner: false, mutable: false },
    },
  });

  console.log(`Achievements Collection created with ID: ${achievementsCollection.parsed.collectionId}`);

  // 3. Create Rewards Collection
  const rewardsCollection = await sdk.collection.createV2({
    name: "F1 Game Rewards",
    description: "Redeemable rewards for Fantasy F1 game",
    symbol: "F1R",
    permissions: { nesting: { collectionAdmin: true } },
    encodeOptions: {
      defaultPermission: { collectionAdmin: true, tokenOwner: false, mutable: true },
    },
  });

  console.log(`Rewards Collection created with ID: ${rewardsCollection.parsed.collectionId}`);

  // Save collection IDs to a config file
  const config = {
    PLAYERS_COLLECTION_ID: playersCollection.parsed.collectionId,
    ACHIEVEMENTS_COLLECTION_ID: achievementsCollection.parsed.collectionId,
    REWARDS_COLLECTION_ID: rewardsCollection.parsed.collectionId,
  };

  await writeFile('./config.json', JSON.stringify(config, null, 2));
  console.log('Configuration saved to config.json');
};

setup().catch((error) => {
  console.error('Error during setup:', error);
  process.exit(1);
});