import Incident from '../models/Incident.js';

/**
 * POST /api/incidents
 * Protected — Create a new incident
 */
export const createIncident = async (req, res) => {
  try {
    const { title, description, category, severity, affectedSystems, assignedTo } =
      req.body;

    if (!title || !description || !category || !severity) {
      return res
        .status(400)
        .json({ message: 'Title, description, category, and severity are required' });
    }

    const incident = await Incident.create({
      title,
      description,
      category,
      severity,
      affectedSystems,
      assignedTo: assignedTo || null,
      reportedBy: req.user._id,
      timeline: [
        {
          action: 'Incident Created',
          notes: `Incident reported by ${req.user.name}`,
          performedBy: req.user._id,
        },
      ],
    });

    await incident.populate([
      { path: 'reportedBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' },
      { path: 'timeline.performedBy', select: 'name email' },
    ]);

    return res.status(201).json(incident);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/incidents
 * Protected — Get all incidents
 */
export const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json(incidents);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/incidents/:id
 * Protected — Get single incident with full timeline
 */
export const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('timeline.performedBy', 'name email');

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    return res.status(200).json(incident);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * PATCH /api/incidents/:id/status
 * Protected — Update incident status and append to timeline
 */
export const updateIncidentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const validStatuses = ['New', 'In Progress', 'Mitigated', 'Resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const previousStatus = incident.status;
    incident.status = status;
    incident.timeline.push({
      action: `Status changed from "${previousStatus}" to "${status}"`,
      notes: notes || '',
      performedBy: req.user._id,
    });

    await incident.save();
    await incident.populate([
      { path: 'reportedBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' },
      { path: 'timeline.performedBy', select: 'name email' },
    ]);

    return res.status(200).json(incident);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * PATCH /api/incidents/:id/assign
 * Protected — Reassign incident to an analyst and log to timeline
 */
export const assignIncident = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    incident.assignedTo = assignedTo || null;
    incident.timeline.push({
      action: assignedTo
        ? `Incident reassigned to analyst`
        : 'Incident unassigned',
      notes: '',
      performedBy: req.user._id,
    });

    await incident.save();
    await incident.populate([
      { path: 'reportedBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' },
      { path: 'timeline.performedBy', select: 'name email' },
    ]);

    return res.status(200).json(incident);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/incidents/:id/notes
 * Protected — Add an analyst note to the timeline
 */
export const addTimelineNote = async (req, res) => {
  try {
    const { notes } = req.body;
    if (!notes || notes.trim() === '') {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    incident.timeline.push({
      action: 'Analyst Note Added',
      notes,
      performedBy: req.user._id,
    });

    await incident.save();
    await incident.populate([
      { path: 'reportedBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' },
      { path: 'timeline.performedBy', select: 'name email' },
    ]);

    return res.status(200).json(incident);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
