import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ShieldAlert,
  Server,
  UserCheck,
  Tag,
  AlignLeft,
  FileText,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';

const categories = ['Malware', 'Phishing', 'Data Leak', 'Unauthorized Access'];
const severities = ['Low', 'Medium', 'High', 'Critical'];

const CreateIncidentPage = () => {
  const navigate = useNavigate();
  const [analysts, setAnalysts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Malware',
    severity: 'Medium',
    affectedSystems: '',
    assignedTo: '',
  });

  useEffect(() => {
    const fetchAnalysts = async () => {
      try {
        const { data } = await api.get('/auth/analysts');
        setAnalysts(data);
      } catch {
        // Fallback silently if analysts endpoint fails
      }
    };
    fetchAnalysts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Incident title is required.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        severity: formData.severity,
        affectedSystems: formData.affectedSystems.trim(),
        assignedTo: formData.assignedTo || null,
      };

      const { data } = await api.post('/incidents', payload);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/incidents/${data._id}`);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create incident ticket.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-cyber-card border border-cyber-border hover:bg-cyber-border text-cyber-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-cyber-text flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-cyber-accent" />
              Log Security Incident
            </h1>
            <p className="text-cyber-muted text-sm mt-1">
              File a new security event for investigation, triage, and forensic tracking.
            </p>
          </div>
        </div>

        {/* Feedback banners */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 mb-6 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Incident successfully registered! Redirecting to incident workspace...
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="incident-title" className="label flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyber-accent" />
              Incident Title <span className="text-red-400">*</span>
            </label>
            <input
              id="incident-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Suspicious outbound traffic spike on DMZ subnet"
              className="input text-base"
              required
            />
          </div>

          {/* Category & Severity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="incident-category" className="label flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-cyber-accent" />
                Category <span className="text-red-400">*</span>
              </label>
              <select
                id="incident-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="incident-severity" className="label flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-cyber-accent" />
                Severity Level <span className="text-red-400">*</span>
              </label>
              <select
                id="incident-severity"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="select"
              >
                {severities.map((sev) => (
                  <option key={sev} value={sev}>
                    {sev}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="incident-description" className="label flex items-center gap-1.5">
              <AlignLeft className="w-4 h-4 text-cyber-accent" />
              Incident Summary & Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="incident-description"
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide technical indicators, timeline of discovery, initial impact, observed hashes, or anomalous user behavior..."
              className="input resize-y"
              required
            />
          </div>

          {/* Affected Systems & Assignee Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="incident-affected" className="label flex items-center gap-1.5">
                <Server className="w-4 h-4 text-cyber-accent" />
                Affected Systems / Hosts
              </label>
              <input
                id="incident-affected"
                type="text"
                name="affectedSystems"
                value={formData.affectedSystems}
                onChange={handleChange}
                placeholder="e.g., AD-DC01, PROD-DB-02, 192.168.1.50/24"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="incident-assignee" className="label flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-cyber-accent" />
                Assign Lead Analyst
              </label>
              <select
                id="incident-assignee"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="select"
              >
                <option value="">-- Unassigned (Triage Pool) --</option>
                {analysts.map((analyst) => (
                  <option key={analyst._id} value={analyst._id}>
                    {analyst.name} ({analyst.role} - {analyst.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-cyber-border">
            <button
              type="button"
              onClick={() => navigate('/incidents')}
              className="btn-secondary text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              id="submit-incident-btn"
              type="submit"
              disabled={loading || success}
              className="btn-primary text-sm flex items-center gap-2 px-6 py-2.5"
            >
              {loading ? (
                <>
                  <div className="spinner w-4 h-4" />
                  Registering Incident...
                </>
              ) : (
                'Create Incident Ticket'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateIncidentPage;
