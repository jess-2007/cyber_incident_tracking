import express from 'express';
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
  assignIncident,
  addTimelineNote,
} from '../controllers/incidentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All incident routes are protected

router.route('/').get(getIncidents).post(createIncident);
router.route('/:id').get(getIncidentById);
router.patch('/:id/status', updateIncidentStatus);
router.patch('/:id/assign', assignIncident);
router.post('/:id/notes', addTimelineNote);

export default router;
