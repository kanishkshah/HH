// File: server.js

import express from 'express';
import bodyParser from 'body-parser';
import { connectSdk } from "./utils/connect-sdk.js";
import { readFileSync } from 'fs';
import { registerPlayer } from './registerPlayer.js';
import { submitPrediction, processPredictionResult } from './gameLogic.js';
import { createReward, redeemReward, getPlayerAchievements } from './rewardRedemption.js';

const app = express();
const port = 3000;

app.use(bodyParser.json());

const config = JSON.parse(readFileSync('./config.json'));

// Middleware to connect SDK for each request
app.use(async (req, res, next) => {
  try {
    const { account, sdk } = await connectSdk();
    req.account = account;
    req.sdk = sdk;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to blockchain' });
  }
});

// Player registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { address, nickname } = req.body;
    const playerId = await registerPlayer(address, nickname);
    res.json({ playerId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Submit prediction endpoint
app.post('/predict', async (req, res) => {
  try {
    const { playerId, raceId, predictionType, predictionValue } = req.body;
    const predictionId = await submitPrediction(playerId, raceId, predictionType, predictionValue);
    res.json({ predictionId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Process prediction results endpoint
app.post('/process-results', async (req, res) => {
  try {
    const { raceId, predictionType, actualResult } = req.body;
    await processPredictionResult(raceId, predictionType, actualResult);
    res.json({ message: 'Results processed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create reward endpoint
app.post('/rewards', async (req, res) => {
  try {
    const { name, description, requiredPoints } = req.body;
    const rewardId = await createReward(name, description, requiredPoints);
    res.json({ rewardId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Redeem reward endpoint
app.post('/redeem', async (req, res) => {
  try {
    const { playerAddress, rewardId } = req.body;
    const result = await redeemReward(playerAddress, rewardId);
    res.json({ success: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get player achievements endpoint
app.get('/achievements/:playerAddress', async (req, res) => {
  try {
    const { playerAddress } = req.params;
    const achievements = await getPlayerAchievements(playerAddress);
    res.json(achievements);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Fantasy F1 API server listening at http://localhost:${port}`);
}); 