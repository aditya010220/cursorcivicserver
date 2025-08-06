import { Worker } from 'bullmq';
import { validateEvidence } from '../services/geminiService';
import CampaignEvidence from '../models/CampaignEvidence';

const worker = new Worker('evidenceValidation', async (job) => {
  const { evidenceId } = job.data;
  
  try {
    const evidence = await CampaignEvidence.findById(evidenceId);
    if (!evidence) return;

    const validationResult = await validateEvidence(evidence);
    
    evidence.verification = {
      isVerified: validationResult.isValid,
      verificationMethod: 'ai_analysis',
      verificationNotes: JSON.stringify({
        confidence: validationResult.confidence,
        concerns: validationResult.concerns,
        recommendations: validationResult.recommendations
      }),
      verificationDate: new Date()
    };

    if (validationResult.confidence < 0.7) {
      evidence.status = 'pending_more_info';
    } else if (validationResult.isValid) {
      evidence.status = 'accepted';
    } else {
      evidence.status = 'rejected';
    }

    await evidence.save();
  } catch (error) {
    console.error('Evidence validation worker error:', error);
  }
}, {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  }
});

export default worker;