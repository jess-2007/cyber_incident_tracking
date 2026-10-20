import mongoose from 'mongoose';

const timelineEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const incidentSchema = new mongoose.Schema(
  {
    incidentID: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: ['Malware', 'Phishing', 'Data Leak', 'Unauthorized Access'],
      required: [true, 'Category is required'],
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: [true, 'Severity is required'],
    },
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Mitigated', 'Resolved'],
      default: 'New',
    },
    affectedSystems: {
      type: String,
      default: '',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timeline: [timelineEntrySchema],
  },
  { timestamps: true }
);

// Auto-generate incidentID before saving
incidentSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  const count = await mongoose.model('Incident').countDocuments();
  this.incidentID = `INC-${1001 + count}`;
  next();
});

const Incident = mongoose.model('Incident', incidentSchema);
export default Incident;
