import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Web3 from 'web3';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the contract ABI from the file
const CampaignPollingABI = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../contracts/CampaignPolling.json'), 'utf8')
).abi;

// Contract deployment configuration
const CAMPAIGN_POLLING_ADDRESS = process.env.CAMPAIGN_POLLING_ADDRESS || '0x0000000000000000000000000000000000000000';

// Contract deployment configuration
const contractConfig = {
  CampaignPolling: {
    address: CAMPAIGN_POLLING_ADDRESS,
    abi: CampaignPollingABI
  }
};

// Web3 connection setup
const setupWeb3Connection = () => {
  const provider = process.env.ETHEREUM_PROVIDER_URL || 'http://localhost:8545';
  const web3 = new Web3(new Web3.providers.HttpProvider(provider));
  return web3;
};

// Contract instance creation
const getContractInstance = (contractName) => {
  const web3 = setupWeb3Connection();
  const config = contractConfig[contractName];
  
  if (!config) {
    throw new Error(`Contract configuration not found for ${contractName}`);
  }
  
  return new web3.eth.Contract(config.abi, config.address);
};

export {
  contractConfig,
  setupWeb3Connection,
  getContractInstance,
  CAMPAIGN_POLLING_ADDRESS,
  CampaignPollingABI
};