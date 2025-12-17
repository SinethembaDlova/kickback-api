import express from 'express';
import { handleYocoWebhook } from '../controllers/webhooks';

const router = express.Router();

// Yoco webhook endpoint (no authentication required - verified by signature)
router.post('/yoco', handleYocoWebhook);

export default router;