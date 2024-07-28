import { connectSdk } from "./utils/connect-sdk.js";
import { Address } from "@unique-nft/sdk/utils";
import { readFileSync } from 'fs';

export const config = JSON.parse(readFileSync('./config.json'));

const ACHIEVEMENTS_COLLECTION_ID = config.ACHIEVEMENTS_COLLECTION_ID;
const PLAYERS_COLLECTION_ID = config.PLAYERS_COLLECTION_ID;

export const processPredictionResult = async (raceId, overtakeOccurred) => {
  const { account, sdk } = await connectSdk();

  // 1. Get all predictions for this race
  const predictions = await getPredictionsForRace(raceId);

  // 2. Calculate the percentage of correct predictions
  const correctPredictions = predictions.filter(p => p.prediction === overtakeOccurred);
  const correctPercentage = (correctPredictions.length / predictions.length) * 100;

  // 3. Calculate achievement rarity (99 - correctPercentage, rounded to nearest integer)
  //const achievementRarity = Math.round(99 - correctPercentage);
  const achievementRarity = Math.floor(Math.random() * 100);

  let nonce = (await sdk.common.getNonce(account)).nonce;
  const transactions = [];

  // 4. Mint achievement NFTs for correct predictions
  for (const prediction of correctPredictions) {
    const ownerAddress = Address.collection.idToAddress(PLAYERS_COLLECTION_ID, prediction.playerId);
    transactions.push(
      sdk.token.createV2({
        collectionId: ACHIEVEMENTS_COLLECTION_ID,
        image: "https://imgs.search.brave.com/-_zDrijI-wphiVNAaYCXG4zKlVrn2nS3zOcHs-Q12jI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvOTEy/OTI4NTgyL3Bob3Rv/L3N1Y2Nlc3MuanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPU9G/THRRdjRYdUVjNEtE/YTRRbkN2RFBCckpC/T0owZUdiYjRUQVRF/bWNBblU9",
        attributes: [
          { trait_type: "Race", value: raceId },
          { trait_type: "Rarity", value: achievementRarity },
          { trait_type: "Type", value: overtakeOccurred ? "Overtake" : "No Overtake" }
        ],
        owner: ownerAddress,
      }, { nonce: nonce++ })
    );
  }

  // 5. Update player statistics
  for (const prediction of predictions) {
    const playerToken = await sdk.token.getV2({collectionId: PLAYERS_COLLECTION_ID, tokenId: prediction.playerId});
    console.log(playerToken);
    //const currentScore = playerToken.attributes.find(a => a.trait_type === "Score").value;
    //const newScore = prediction.prediction === overtakeOccurred ? currentScore + achievementRarity : currentScore;

    transactions.push(
      sdk.token.setProperties({
        collectionId: PLAYERS_COLLECTION_ID,
        tokenId: prediction.playerId,
        properties: [{
          key: "tokenData",
          value: JSON.stringify([
            { trait_type: "Score", value: 67 },
          ])
        }]
      }, { nonce: nonce++ })
    );
  }

  // 6. Execute all transactions
  await Promise.all(transactions);

  console.log(`Round completed for race ${raceId}. ${correctPredictions.length} correct predictions out of ${predictions.length}.`);
};

  const getPredictionsForRace = async (raceId) => {
    return [
      { playerId: 1, prediction: true },
      //{ playerId: 2, prediction: false },
      // ... more predictions
    ];
  };

// Example usage
processPredictionResult("MonacoGP2024", true).catch(e => {
  console.log("Error during F1 round play:", e);
});