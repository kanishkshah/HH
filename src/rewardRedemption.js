// File: rewardRedemption.js

import { connectSdk } from "./utils/connect-sdk.js";
import { readFileSync } from 'fs';
import { Address } from "@unique-nft/sdk/utils";

export const config = JSON.parse(readFileSync('./config.json'));

export const createReward = async (name, description, requiredPoints) => {
  const { sdk } = await connectSdk();

  const rewardToken = await sdk.token.createV2({
    collectionId: config.REWARDS_COLLECTION_ID,
    attributes: [
      { trait_type: "Name", value: name },
      { trait_type: "Description", value: description },
      { trait_type: "RequiredPoints", value: requiredPoints },
      { trait_type: "Available", value: true },
    ],
  });

  if (!rewardToken.parsed) throw new Error("Failed to create reward token");

  console.log(`Reward created with token ID: ${rewardToken.parsed.tokenId}`);
  return rewardToken.parsed.tokenId;
};

export const getPlayerAchievements = async (playerAddress) => {
  const { sdk } = await connectSdk();

  const achievements = await sdk.token.getTokensByAddress({
    collectionId: config.ACHIEVEMENTS_COLLECTION_ID,
    address: playerAddress,
  });

  return achievements;
};

const calculateTotalPoints = (achievements) => {
  return achievements.reduce((total, achievement) => {
    const rarity = achievement.attributes.find(a => a.trait_type === "Rarity").value;
    return total + parseInt(rarity);
  }, 0);
};

export const redeemReward = async (playerAddress, rewardId) => {
  const { sdk } = await connectSdk();

  // 1. Get the reward details
  const reward = await sdk.token.getV2({
    collectionId: config.REWARDS_COLLECTION_ID,
    tokenId: rewardId,
  });

  const requiredPoints = parseInt(reward.attributes.find(a => a.trait_type === "RequiredPoints").value);
  const isAvailable = reward.attributes.find(a => a.trait_type === "Available").value === "true";

  if (!isAvailable) {
    throw new Error("This reward is no longer available.");
  }

  // 2. Get player's achievements and calculate total points
  const achievements = await getPlayerAchievements(playerAddress);
  const totalPoints = calculateTotalPoints(achievements);

  if (totalPoints < requiredPoints) {
    throw new Error(`Not enough points. Required: ${requiredPoints}, Available: ${totalPoints}`);
  }

  // 3. Transfer the reward to the player
  await sdk.token.transfer({
    collectionId: config.REWARDS_COLLECTION_ID,
    tokenId: rewardId,
    to: playerAddress,
  });

  // 4. Mark the reward as redeemed
  await sdk.token.setProperties({
    collectionId: config.REWARDS_COLLECTION_ID,
    tokenId: rewardId,
    properties: [{
      key: "tokenData",
      value: JSON.stringify([
        ...reward.attributes.filter(a => a.trait_type !== "Available"),
        { trait_type: "Available", value: false },
        { trait_type: "RedeemedBy", value: playerAddress },
      ])
    }]
  });

  // 5. Burn the used achievement tokens
  let pointsBurned = 0;
  for (const achievement of achievements) {
    if (pointsBurned >= requiredPoints) break;
    
    const rarity = parseInt(achievement.attributes.find(a => a.trait_type === "Rarity").value);
    await sdk.token.burn({
      collectionId: config.ACHIEVEMENTS_COLLECTION_ID,
      tokenId: achievement.tokenId,
    });
    
    pointsBurned += rarity;
  }

  console.log(`Reward ${rewardId} redeemed by ${playerAddress}`);
  return true;
};

// Example usage
const examplePlayerAddress = "5GvLPTPrWuuyGGW8eWppxD6kaGTQSbj8faJCoPHhT8KTanj7";

createReward("VIP Race Ticket", "Exclusive access to an F1 race of your choice", 1000)
  .then(rewardId => console.log(`New reward created with ID: ${rewardId}`))
  .catch(error => console.error('Error creating reward:', error));

redeemReward(examplePlayerAddress, 1) // Assuming reward with ID 1 exists
  .then(result => console.log('Reward redemption result:', result))
  .catch(error => console.error('Error redeeming reward:', error)); 