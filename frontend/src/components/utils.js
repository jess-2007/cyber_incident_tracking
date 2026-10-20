/**
 * Returns appropriate Tailwind badge class for a severity level
 */
export const getSeverityBadge = (severity) => {
  const map = {
    Critical: 'badge-critical',
    High: 'badge-high',
    Medium: 'badge-medium',
    Low: 'badge-low',
  };
  return map[severity] || 'badge-low';
};

/**
 * Returns appropriate Tailwind badge class for a status value
 */
export const getStatusBadge = (status) => {
  const map = {
    New: 'badge-new',
    'In Progress': 'badge-progress',
    Mitigated: 'badge-mitigated',
    Resolved: 'badge-resolved',
  };
  return map[status] || 'badge-new';
};

/**
 * Format a date string to a readable local time
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format file size in bytes to a human-readable string
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};
