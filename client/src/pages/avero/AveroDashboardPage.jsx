import React, { useEffect, useState } from 'react';
import { getAveroDashboard } from '../../services/avero/averoApi.js';
import { StatCard, Card, CardHeader, CardContent, Skeleton, EmptyState, useToast, Tag } from '../../components/ui/index.js';

export default function AveroDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getAveroDashboard();
      setData(res);
    } catch (err) {
      toast.push(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[1,2,3,4].map(i => <Skeleton key={i} height="120px" />)}
        </div>
        <Skeleton height="300px" />
      </div>
    );
  }

  if (!data) return <EmptyState title="No Dashboard Data" message="Unable to load dashboard." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <h1 style={{ color: '#173d35', margin: 0 }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard title="Today's Sales" value={data.todaySales || '$0.00'} trend={data.salesTrend} />
        <StatCard title="Inventory Value" value={data.inventoryValue || '$0.00'} />
        <StatCard title="Recoverable Salvage" value={data.recoverableSalvage || '$0.00'} />
        <StatCard title="Active SKUs" value={data.activeSkus || '0'} />
        <StatCard title="Open Returns" value={data.openReturns || '0'} />
        <StatCard title="Terminals Online" value={data.terminalsOnline || '0'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <Card>
          <CardHeader title="Needs Your Attention" />
          <CardContent>
            {data.attentionItems?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.attentionItems.map((item, idx) => (
                  <div key={idx} style={{ padding: '16px', border: '1px solid #d8ded0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#173d35' }}>{item.title}</h4>
                      <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{item.description}</p>
                    </div>
                    <Tag color="red">{item.tag}</Tag>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="All caught up!" message="No items need your attention right now." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Recent Audit Logs" />
          <CardContent>
            {data.auditLogs?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.auditLogs.map((log, idx) => (
                  <div key={idx} style={{ fontSize: '0.9rem' }}>
                    <span style={{ color: '#666', fontSize: '0.8rem' }}>{new Date(log.created_at).toLocaleString()}</span>
                    <p style={{ margin: '4px 0 0 0' }}><strong>{log.action}</strong> on {log.entity_type}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No logs" message="No recent activity." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
