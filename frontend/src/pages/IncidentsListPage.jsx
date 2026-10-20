import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  Shield,
  ArrowUpDown,
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { getSeverityBadge, getStatusBadge, formatDate } from '../components/utils';

const categories = ['All', 'Malware', 'Phishing', 'Data Leak', 'Unauthorized Access'];
const severities = ['All', 'Critical', 'High', 'Medium', 'Low'];
const statuses = ['All', 'New', 'In Progress', 'Mitigated', 'Resolved'];

const IncidentsListPage = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchIncidents = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/incidents');
      setIncidents(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve incidents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Filtered incidents
  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.title?.toLowerCase().includes(search.toLowerCase()) ||
      incident.incidentID?.toLowerCase().includes(search.toLowerCase()) ||
      incident.affectedSystems?.toLowerCase().includes(search.toLowerCase()) ||
      incident.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All' || incident.category === categoryFilter;
    const matchesSeverity =
      severityFilter === 'All' || incident.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'All' || incident.status === statusFilter;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  return (
    <Layout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-cyber-text flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyber-accent" />
              Incident Repository
            </h1>
            <p className="text-cyber-muted text-sm mt-1">
              Filter, triage, and inspect all reported cyber threats and security incidents.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchIncidents}
              className="btn-secondary flex items-center gap-2 text-sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/incidents/new')}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              New Incident
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="card p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, title, host..."
                className="input pl-9 text-sm"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="select text-sm py-2"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="select text-sm py-2"
              >
                {severities.map((sev) => (
                  <option key={sev} value={sev}>
                    Severity: {sev}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select text-sm py-2"
              >
                {statuses.map((stat) => (
                  <option key={stat} value={stat}>
                    Status: {stat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Metrics */}
          <div className="flex items-center justify-between text-xs text-cyber-muted pt-2 border-t border-cyber-border">
            <span>
              Showing <strong className="text-cyber-text">{filteredIncidents.length}</strong> of{' '}
              <strong className="text-cyber-text">{incidents.length}</strong> incidents
            </span>
            {(search || categoryFilter !== 'All' || severityFilter !== 'All' || statusFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('All');
                  setSeverityFilter('All');
                  setStatusFilter('All');
                }}
                className="text-cyber-accent hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
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
          ) : filteredIncidents.length === 0 ? (
            <div className="text-center py-16">
              <Shield className="w-12 h-12 text-cyber-muted mx-auto mb-3 opacity-40" />
              <p className="text-cyber-text font-medium">No incidents matched your query</p>
              <p className="text-cyber-muted text-xs mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyber-border bg-cyber-bg/40">
                    <th className="text-left text-xs font-semibold text-cyber-muted uppercase tracking-wider py-3.5 px-4">
                      Incident ID
                    </th>
                    <th className="text-left text-xs font-semibold text-cyber-muted uppercase tracking-wider py-3.5 px-4">
                      Title & Systems
                    </th>
                    <th className="text-left text-xs font-semibold text-cyber-muted uppercase tracking-wider py-3.5 px-4">
                      Category
                    </th>
                    <th className="text-left text-xs font-semibold text-cyber-muted uppercase tracking-wider py-3.5 px-4">
                      Severity
                    </th>
                    <th className="text-left text-xs font-semibold text-cyber-muted uppercase tracking-wider py-3.5 px-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-semibold text-cyber-muted uppercase tracking-wider py-3.5 px-4">
                      Assigned To
                    </th>
                    <th className="text-left text-xs font-semibold text-cyber-muted uppercase tracking-wider py-3.5 px-4">
                      Reported By
                    </th>
                    <th className="text-left text-xs font-semibold text-cyber-muted uppercase tracking-wider py-3.5 px-4">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border">
                  {filteredIncidents.map((incident) => (
                    <tr
                      key={incident._id}
                      onClick={() => navigate(`/incidents/${incident._id}`)}
                      className="table-row group"
                    >
                      <td className="py-4 px-4 text-xs font-mono font-bold text-cyber-accent">
                        {incident.incidentID}
                      </td>
                      <td className="py-4 px-4 max-w-sm">
                        <p className="text-sm font-medium text-cyber-text group-hover:text-cyber-accent transition-colors truncate">
                          {incident.title}
                        </p>
                        {incident.affectedSystems && (
                          <p className="text-xs text-cyber-muted truncate mt-0.5">
                            Target: {incident.affectedSystems}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs text-cyber-text-dim bg-cyber-border/70 border border-cyber-border px-2.5 py-1 rounded-md font-medium">
                          {incident.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={getSeverityBadge(incident.severity)}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={getStatusBadge(incident.status)}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-cyber-text-dim">
                        {incident.assignedTo ? (
                          <span className="font-medium text-cyber-text">
                            {incident.assignedTo.name}
                          </span>
                        ) : (
                          <span className="text-yellow-400/80 text-xs italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs text-cyber-muted">
                        {incident.reportedBy?.name || 'System'}
                      </td>
                      <td className="py-4 px-4 text-xs text-cyber-muted whitespace-nowrap">
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

export default IncidentsListPage;
