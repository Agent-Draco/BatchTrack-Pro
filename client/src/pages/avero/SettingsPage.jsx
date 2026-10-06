import React from 'react';
import { Card, CardHeader, CardContent, Button } from '../../components/ui/index.js';

export default function SettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <h1 style={{ color: '#173d35', margin: 0 }}>Organization Settings</h1>
      
      <Card>
        <CardHeader title="General Settings" />
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 'bold' }}>Organization Name</label>
              <input type="text" defaultValue="Avero Retail" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 'bold' }}>Contact Phone</label>
              <input type="text" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Staff Management" />
        <CardContent>
          <p>Invite and manage staff access to the Enterprise Portal and POS Terminals.</p>
          <Button variant="secondary">Invite Staff</Button>
        </CardContent>
      </Card>
    </div>
  );
}
