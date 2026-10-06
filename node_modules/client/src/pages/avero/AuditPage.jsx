import React, { useEffect, useState } from 'react';
import { getAveroAuditLogs } from '../../services/avero/averoApi.js';
import { DataTable, useToast, Skeleton, EmptyState } from '../../components/ui/index.js';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await getAveroAuditLogs();
      setLogs(data);
    } catch (err) {
      toast.push(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Timestamp', accessor: 'created_at', render: (v) => new Date(v).toLocaleString() },
    { header: 'User', accessor: 'user_email' },
    { header: 'Action', accessor: 'action' },
    { header: 'Entity', accessor: 'entity_type' },
    { header: 'Entity ID', accessor: 'entity_id' },
    { header: 'Details', accessor: 'metadata', render: (v) => <pre style={{fontSize:'0.75rem', margin:0}}>{JSON.stringify(v)}</pre> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ color: '#173d35', margin: 0 }}>Audit Logs</h1>
      
      <div style={{ backgroundColor: '#fffefb', padding: '24px', borderRadius: '16px', border: '1px solid #d8ded0' }}>
        {loading ? (
          <Skeleton height="300px" />
        ) : logs.length > 0 ? (
          <DataTable columns={columns} data={logs} />
        ) : (
          <EmptyState title="No Audit Logs" message="No activity recorded yet." />
        )}
      </div>
    </div>
  );
}
