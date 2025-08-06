// import express from 'express';
// import cors from 'cors';
// import { createServer } from 'http';
// import cookieParser from 'cookie-parser';
// import dotenv from 'dotenv';
// import connectDB from './db/mongo.js';
// import campaignRoute from './routes/campaignRoutes.js'; // Assuming you have a campaignRoute
// import campaignActivityRoute from './routes/activityRoute.js'; 
// import victimRoutes from './routes/CampaignVictimRoute.js'; // Assuming you have a victimRoute
// //Routes 
// import authRoute from './routes/authRoute.js';
// import supporterRoutes from './routes/CampaignSupport.js'; // Assuming you have a supporterRoute
// // import campaignPollsRoute from './routes/campaignPolls.js'; // Assuming you have a campaignPollsRoute
// import campaignPollsRoute from './routes/campaignPolls.js'; // Assuming you have a campaignPollsRoute

// dotenv.config();
// connectDB();

// const app = express();
// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));


// app.get('/', (req, res) => {
//   res.send('Hello World!');
// }
// );


// app.use('/api/users', authRoute);
// app.use('/api/campaigns', campaignRoute); 
// app.use('/api/campaigns', campaignActivityRoute); 
// app.use('/api/campaigns/:campaignId/victims', victimRoutes);
// app.use('/api/campaigns/:campaignId/supporters', supporterRoutes);
// // app.use('/api/campaigns/:campaignId/polls', campaignPollsRoute); // Assuming you have a campaignPollsRoute
// app.use('/api/campaigns/:campaignId/polls', campaignPollsRoute); 
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './db/mongo.js';

// Load environment variables
dotenv.config(); // ✅ MUST be before using any env variable

// Database connection
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Test route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Routes
import campaignRoute from './routes/campaignRoutes.js';
import campaignActivityRoute from './routes/activityRoute.js';
import victimRoutes from './routes/CampaignVictimRoute.js';
import authRoute from './routes/authRoute.js';
import supporterRoutes from './routes/CampaignSupport.js';
import campaignPollsRoute from './routes/campaignPolls.js';

app.use('/api/users', authRoute);
app.use('/api/campaigns', campaignRoute);
app.use('/api/campaigns', campaignActivityRoute);
app.use('/api/campaigns/:campaignId/victims', victimRoutes);
app.use('/api/campaigns/:campaignId/supporters', supporterRoutes);
app.use('/api/campaigns/:campaignId/polls', campaignPollsRoute);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
