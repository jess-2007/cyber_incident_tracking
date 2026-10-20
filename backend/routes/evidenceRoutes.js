import express from 'express';
import { uploadEvidence, getEvidenceByIncident } from '../controllers/evidenceController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// mergeParams allows access to :id from the parent incidentRoutes
const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .post(upload.single('file'), uploadEvidence)
  .get(getEvidenceByIncident);

export default router;
