// File: registerPlayer.js

import { connectSdk } from "./utils/connect-sdk.js";
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./config.json'));

export const registerPlayer = async (playerAddress, nickname) => {
  const { sdk } = await connectSdk();

  const playerToken = await sdk.token.createV2({
    collectionId: config.PLAYERS_COLLECTION_ID,
    owner: playerAddress,
    attributes: [
      { trait_type: "Nickname", value: nickname },
      { trait_type: "Score", value: 0 },
      { trait_type: "TotalPredictions", value: 0 },
      { trait_type: "CorrectPredictions", value: 0 },
    ],
  });

  if (!playerToken.parsed) throw new Error("Failed to create player token");

  console.log(`Player registered with token ID: ${playerToken.parsed.tokenId}`);
  return playerToken.parsed.tokenId;
};

// Example usage
const playerAddress = "5GvLPTPrWuuyGGW8eWppxD6kaGTQSbj8faJCoPHhT8KTanj7"; // Replace with actual address
const nickname = "F1Fan123";

registerPlayer(playerAddress, nickname).catch((error) => {
  console.error('Error registering player:', error);
});