import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  Clock,
  UserCheck,
  Server,
  FileText,
  UploadCloud,
  FileCode,
  Download,
  AlertTriangle,
  CheckCircle2,
  Send,
  MessageSquare,
  Activity,
  History,
  Tag,
  Paperclip,
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { getSeverityBadge, getStatusBadge, formatDate, formatFileSize } from '../components/utils';

const availableStatuses = ['New', 'In Progress', 'Mitigated', 'Resolved'];

const IncidentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [analysts, setAnalysts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Timeline note state
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Status update state
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');

  // Reassignment state
  const [assigning, setAssigning] = useState(false);

  // Evidence upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef(null);

  const fetchIncidentData = async () => {
    try {
      const [incidentRes, evidenceRes, analystsRes] = await Promise.all([
        api.get(`/incidents/${id}`),
        api.get(`/incidents/${id}/evidence`),
        api.get('/auth/analysts').catch(() => ({ data: [] })),
      ]);
      setIncident(incidentRes.data);
      setEvidenceList(evidenceRes.data);
      setAnalysts(analystsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load incident details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentData();
  }, [id]);

  // Handle status update
  const handleStatusChangeClick = (status) => {
    if (status === incident.status) return;
    setTargetStatus(status);
    setStatusNote('');
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    setStatusUpdating(true);
    try {
      const { data } = await api.patch(`/incidents/${id}/status`, {
        status: targetStatus,
        notes: statusNote.trim(),
      });
      setIncident(data);
      setShowStatusModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handle analyst assignment
  const handleAssignChange = async (e) => {
    const newAnalystId = e.target.value;
    setAssigning(true);
    try {
      const { data } = await api.patch(`/incidents/${id}/assign`, {
        assignedTo: newAnalystId || null,
      });
      setIncident(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reassign analyst.');
    } finally {
      setAssigning(false);
    }
  };

  // Handle timeline note submission
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setAddingNote(true);
    try {
      const { data } = await api.post(`/incidents/${id}/notes`, {
        notes: noteText.trim(),
      });
      setIncident(data);
      setNoteText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add timeline note.');
    } finally {
      setAddingNote(false);
    }
  };

  // Handle file evidence upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post(`/incidents/${id}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEvidenceList((prev) => [data, ...prev]);
      setUploadSuccess(`Uploaded ${file.name} successfully.`);
      // Refresh incident to catch timeline update
      const updatedInc = await api.get(`/incidents/${id}`);
      setIncident(updatedInc.data);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError(
        err.response?.data?.message || 'Failed to upload evidence file. Check format and size (max 10MB).'
      );
    } finally {
      setUploadingFile(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="spinner w-10 h-10" />
        </div>
      </Layout>
    );
  }

  if (error || !incident) {
    return (
      <Layout>
        <div className="card text-center py-16 max-w-xl mx-auto">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-cyber-text mb-2">Error Loading Incident</h2>
          <p className="text-cyber-muted mb-6">{error || 'Incident not found'}</p>
          <button onClick={() => navigate('/incidents')} className="btn-secondary">
            Return to Incidents
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in space-y-6 max-w-7xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/incidents')}
            className="flex items-center gap-2 text-sm text-cyber-muted hover:text-cyber-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Incidents
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-cyber-muted font-mono">
              Created: {formatDate(incident.createdAt)}
            </span>
          </div>
        </div>

        {/* Hero Incident Header */}
        <div className="card relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-bold text-cyber-accent bg-cyber-accent/10 px-2.5 py-1 rounded border border-cyber-accent/20">
                  {incident.incidentID}
                </span>
                <span className={getSeverityBadge(incident.severity)}>
                  {incident.severity} Severity
                </span>
                <span className={getStatusBadge(incident.status)}>
                  {incident.status}
                </span>
                <span className="text-xs text-cyber-text-dim bg-cyber-border px-2.5 py-1 rounded">
                  {incident.category}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-cyber-text">{incident.title}</h1>
              {incident.affectedSystems && (
                <p className="text-sm text-cyber-muted flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-cyber-accent" />
                  Affected Systems: <span className="text-cyber-text">{incident.affectedSystems}</span>
                </p>
              )}
            </div>

            {/* Quick Actions & Reassignment */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:border-l lg:border-cyber-border lg:pl-6">
              <div>
                <label className="text-xs font-semibold text-cyber-muted uppercase tracking-wider block mb-1">
                  Assignee
                </label>
                <select
                  value={incident.assignedTo?._id || ''}
                  onChange={handleAssignChange}
                  disabled={assigning}
                  className="select text-sm py-1.5 min-w-[200px]"
                >
                  <option value="">Unassigned</option>
                  {analysts.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status Progression Workflow Bar */}
          <div className="mt-6 pt-5 border-t border-cyber-border">
            <p className="text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-2.5">
              Incident Status Transition
            </p>
            <div className="flex flex-wrap gap-2">
              {availableStatuses.map((st) => {
                const isActive = incident.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => handleStatusChangeClick(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-cyber-accent text-cyber-bg ring-2 ring-cyber-accent ring-offset-2 ring-offset-cyber-card'
                        : 'bg-cyber-bg border border-cyber-border text-cyber-muted hover:text-cyber-text hover:border-cyber-accent/50'
                    }`}
                  >
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Grid: Left 2 Cols (Details & Timeline), Right 1 Col (Evidence) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 spans) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description & Technical Summary */}
            <div className="card space-y-4">
              <h2 className="text-base font-semibold text-cyber-text flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyber-accent" />
                Incident Description & Threat Assessment
              </h2>
              <div className="p-4 rounded-lg bg-cyber-bg/70 border border-cyber-border text-sm text-cyber-text whitespace-pre-wrap leading-relaxed">
                {incident.description}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div>
                  <span className="text-cyber-muted block">Reported By</span>
                  <span className="font-medium text-cyber-text mt-0.5 block">
                    {incident.reportedBy?.name || 'Security Monitor'} ({incident.reportedBy?.email || 'N/A'})
                  </span>
                </div>
                <div>
                  <span className="text-cyber-muted block">Category</span>
                  <span className="font-medium text-cyber-text mt-0.5 block">
                    {incident.category}
                  </span>
                </div>
                <div>
                  <span className="text-cyber-muted block">Last Updated</span>
                  <span className="font-medium text-cyber-text mt-0.5 block">
                    {formatDate(incident.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Timeline Log */}
            <div className="card space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-cyber-text flex items-center gap-2">
                  <History className="w-4 h-4 text-cyber-accent" />
                  Activity Timeline & Audit Trail
                </h2>
                <span className="text-xs text-cyber-muted">
                  {incident.timeline?.length || 0} event(s) logged
                </span>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Append triage note, IOC finding, or mitigation action..."
                  className="input text-sm"
                />
                <button
                  type="submit"
                  disabled={addingNote || !noteText.trim()}
                  className="btn-primary text-xs px-4 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  {addingNote ? 'Adding...' : 'Post Note'}
                </button>
              </form>

              {/* Timeline Items List */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-cyber-border">
                {incident.timeline && incident.timeline.length > 0 ? (
                  [...incident.timeline].reverse().map((entry, idx) => (
                    <div key={entry._id || idx} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-cyber-accent ring-4 ring-cyber-card" />
                      
                      <div className="bg-cyber-bg/50 border border-cyber-border p-3.5 rounded-lg space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-cyber-text">
                            {entry.action}
                          </span>
                          <span className="text-cyber-muted">
                            {formatDate(entry.timestamp)}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-cyber-text-dim mt-1 pl-2 border-l-2 border-cyber-accent/40 italic">
                            &ldquo;{entry.notes}&rdquo;
                          </p>
                        )}
                        <p className="text-[11px] text-cyber-muted mt-1">
                          Logged by: {entry.performedBy?.name || 'Security System'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-cyber-muted">No timeline entries recorded.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (1 span): Forensic Evidence Section */}
          <div className="space-y-6">
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-cyber-text flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-cyber-accent" />
                  Forensic Evidence
                </h2>
                <span className="text-xs text-cyber-muted">
                  {evidenceList.length} file(s)
                </span>
              </div>

              <p className="text-xs text-cyber-muted">
                Attach packet captures (.pcap), log extracts (.log, .txt), or screenshots (.png, .jpg) up to 10MB.
              </p>

              {/* Upload trigger */}
              <div className="pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".log,.pcap,.png,.jpg,.jpeg,.pdf,.txt"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="btn-secondary w-full py-3 border-dashed border-2 border-cyber-border flex flex-col items-center justify-center gap-2 hover:border-cyber-accent/60 transition-colors"
                >
                  <UploadCloud className="w-6 h-6 text-cyber-accent" />
                  <span className="text-xs font-semibold text-cyber-text">
                    {uploadingFile ? 'Uploading Evidence...' : 'Click to Upload Evidence'}
                  </span>
                  <span className="text-[10px] text-cyber-muted">
                    .pcap, .log, .pdf, .txt, .png, .jpg
                  </span>
                </button>
              </div>

              {uploadError && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded">
                  {uploadError}
                </div>
              )}

              {uploadSuccess && (
                <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 p-2.5 rounded">
                  {uploadSuccess}
                </div>
              )}

              {/* Evidence File List */}
              <div className="space-y-2.5 pt-2">
                {evidenceList.length === 0 ? (
                  <div className="text-center py-8 bg-cyber-bg/40 rounded-lg border border-cyber-border">
                    <FileCode className="w-8 h-8 text-cyber-muted mx-auto mb-2 opacity-40" />
                    <p className="text-xs text-cyber-muted">No evidence files attached yet.</p>
                  </div>
                ) : (
                  evidenceList.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-lg bg-cyber-bg border border-cyber-border hover:border-cyber-accent/30 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex items-center gap-2.5">
                        <div className="p-2 rounded bg-cyber-card text-cyber-accent">
                          <FileCode className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-cyber-text truncate">
                            {item.fileName}
                          </p>
                          <p className="text-[10px] text-cyber-muted mt-0.5">
                            {formatFileSize(item.fileSize)} • {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Download link pointing to static uploads endpoint */}
                      <a
                        href={`http://localhost:5000/${item.filePath?.replace(/\\/g, '/')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded hover:bg-cyber-card text-cyber-muted hover:text-cyber-accent transition-colors"
                        title="Download / View"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Transition Note Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="card max-w-md w-full space-y-4 animate-slide-up">
              <h3 className="text-lg font-bold text-cyber-text flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyber-accent" />
                Change Status to &ldquo;{targetStatus}&rdquo;
              </h3>
              <p className="text-xs text-cyber-muted">
                Optionally enter rationale or remediation notes to document in the timeline audit trail.
              </p>
              <div>
                <label className="label">Timeline Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g., Containment verified, compromised credentials rotated..."
                  className="input text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="btn-secondary text-xs"
                  disabled={statusUpdating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmStatusChange}
                  disabled={statusUpdating}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {statusUpdating ? 'Updating...' : `Confirm → ${targetStatus}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default IncidentDetailsPage;
