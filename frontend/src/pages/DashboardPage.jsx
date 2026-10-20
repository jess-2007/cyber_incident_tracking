import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Shield,
  Clock,
  UserX,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { getSeverityBadge, getStatusBadge, formatDate } from '../components/utils';

const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
  <div className={`card relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}>
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${color}-glow`} />
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <p className="text-3xl font-bold text-cyber-text mb-1">{value}</p>
    <p className="text-sm font-medium text-cyber-text-dim">{label}</p>
    {subtext && <p className="text-xs text-cyber-muted mt-1">{subtext}</p>}
  </div>
);

const DashboardPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchIncidents = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/incidents');
      setIncidents(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load incidents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Compute metrics
  const total = incidents.length;
  const criticalOpen = incidents.filter(
    (i) => i.severity === 'Critical' && i.status !== 'Resolved'
  ).length;
  const unassigned = incidents.filter((i) => !i.assignedTo).length;
  const inProgress = incidents.filter((i) => i.status === 'In Progress').length;

  const recentIncidents = incidents.slice(0, 8);

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cyber-text">Security Dashboard</h1>
            <p className="text-cyber-muted text-sm mt-1">
              Real-time overview of all security incidents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="dashboard-refresh"
              onClick={fetchIncidents}
              className="btn-secondary flex items-center gap-2 text-sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              id="dashboard-new-incident"
              onClick={() => navigate('/incidents/new')}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              New Incident
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            icon={Shield}
            label="Total Incidents"
            value={total}
            color="bg-cyber-accent/10 text-cyber-accent"
            subtext="All time"
          />
          <StatCard
            icon={AlertTriangle}
            label="Critical Open"
            value={criticalOpen}
            color="bg-red-500/10 text-red-400"
            subtext="Needs attention"
          />
          <StatCard
            icon={UserX}
            label="Unassigned"
            value={unassigned}
            color="bg-yellow-500/10 text-yellow-400"
            subtext="Awaiting analyst"
          />
          <StatCard
            icon={TrendingUp}
            label="In Progress"
            value={inProgress}
            color="bg-purple-500/10 text-purple-400"
            subtext="Active investigations"
          />
        </div>

        {/* Incidents table */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyber-accent" />
              <h2 className="text-lg font-semibold text-cyber-text">Recent Incidents</h2>
            </div>
            <button
              id="dashboard-view-all"
              onClick={() => navigate('/incidents')}
              className="flex items-center gap-1 text-sm text-cyber-accent hover:underline"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="spinner w-8 h-8" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-cyber-muted">{error}</p>
              <button onClick={fetchIncidents} className="btn-secondary mt-4 text-sm">
                Try Again
              </button>
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-16">
              <Shield className="w-12 h-12 text-cyber-muted mx-auto mb-4 opacity-40" />
              <p className="text-cyber-muted">No incidents reported yet.</p>
              <button
                onClick={() => navigate('/incidents/new')}
                className="btn-primary mt-4 text-sm"
              >
                Report First Incident
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyber-border">
                    <th className="text-left text-xs font-semibold text-cyber-muted uppercase tracking-wide pb-3 pr-4">
                      ID
                    </th>
                    <th className="text-left text-xs font-semibold text-cyber-muted uppercase tracking-wide pb-3 pr-4">
                      Title
                    </th>
                    <th className="text-left text-xs font-semibold text-cyber-muted uppercase tracking-wide pb-3 pr-4">
                      Category
                    </th>
                    <th className="text-left text-xs font-semibold text-cyber-muted uppercase tracking-wide pb-3 pr-4">
                      Severity
                    </th>
                    <th className="text-left text-xs font-semibold text-cyber-muted uppercase tracking-wide pb-3 pr-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-semibold text-cyber-muted uppercase tracking-wide pb-3 pr-4">
                      Assigned To
                    </th>
                    <th className="text-left text-xs font-semibold text-cyber-muted uppercase tracking-wide pb-3">
                      Reported
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentIncidents.map((incident) => (
                    <tr
                      key={incident._id}
                      className="table-row"
                      onClick={() => navigate(`/incidents/${incident._id}`)}
                    >
                      <td className="py-3.5 pr-4 text-xs font-mono text-cyber-accent">
                        {incident.incidentID}
                      </td>
                      <td className="py-3.5 pr-4 max-w-xs">
                        <p className="text-sm font-medium text-cyber-text truncate">
                          {incident.title}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="text-xs text-cyber-text-dim bg-cyber-border px-2 py-1 rounded-md">
                          {incident.category}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={getSeverityBadge(incident.severity)}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={getStatusBadge(incident.status)}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-sm text-cyber-text-dim">
                        {incident.assignedTo?.name || (
                          <span className="text-yellow-500/70 text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 text-xs text-cyber-muted">
                        {formatDate(incident.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
