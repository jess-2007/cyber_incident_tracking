import Evidence from '../models/Evidence.js';
import Incident from '../models/Incident.js';

/**
 * POST /api/incidents/:id/evidence
 * Protected — Upload evidence file linked to an incident
 */
export const uploadEvidence = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const evidence = await Evidence.create({
      incidentId: incident._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
    });

    // Log evidence upload in the incident timeline
    incident.timeline.push({
      action: `Evidence uploaded: ${req.file.originalname}`,
      notes: '',
      performedBy: req.user._id,
    });
    await incident.save();

    await evidence.populate('uploadedBy', 'name email');

    return res.status(201).json(evidence);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/incidents/:id/evidence
 * Protected — Retrieve all evidence files linked to an incident
 */
export const getEvidenceByIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const evidenceList = await Evidence.find({ incidentId: req.params.id })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(evidenceList);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
