import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/index.js';
import { Card, CardHeader, CardContent, Button } from '../../components/ui/index.js';

export default function ProfilePage() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/avero/auth');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
      <h1 style={{ color: '#173d35', margin: 0 }}>My Profile</h1>
      
      <Card>
        <CardHeader title="User Details" />
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>Role:</strong> {role || 'Standard'}</div>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <Button onClick={handleSignOut} variant="danger">Sign Out</Button>
              <Button variant="secondary" onClick={() => navigate('/')}>Return to BatchTrack Home</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
