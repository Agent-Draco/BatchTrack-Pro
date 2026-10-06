import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { posInitiateReturn } from '../../services/pos/posApi.js';
import { Button, useToast, Tag } from '../../components/ui/index.js';

export default function PosReturnPage() {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [items, setItems] = useState([]); // Dummy data structure for return items
  const toast = useToast();
  const navigate = useNavigate();

  const handleLookup = (e) => {
    e.preventDefault();
    // Simulate lookup
    if (invoiceNumber) {
      setItems([
        { id: '1', name: 'Product A', qty: 1, price: 10.00, condition: 'UNOPENED' },
        { id: '2', name: 'Product B', qty: 1, price: 20.00, condition: 'UNOPENED' }
      ]);
    }
  };

  const handleReturn = async () => {
    try {
      await posInitiateReturn({ invoiceNumber, items });
      toast.push('Return processed successfully', 'success');
      navigate('/pos');
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Process Return</h2>
        <Button variant="secondary" onClick={() => navigate('/pos')}>Back to Terminal</Button>
      </div>

      <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '16px' }}>
        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <input 
            type="text" 
            value={invoiceNumber}
            onChange={e => setInvoiceNumber(e.target.value)}
            placeholder="Scan or enter Invoice #..."
            style={{ flex: 1, padding: '12px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px' }}
          />
          <Button type="submit">Lookup</Button>
        </form>

        {items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0 }}>Select Items to Return</h3>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div>1 x ${item.price.toFixed(2)}</div>
                </div>
                <select 
                  value={item.condition} 
                  onChange={e => {
                    const newItems = [...items];
                    newItems[idx].condition = e.target.value;
                    setItems(newItems);
                  }}
                  style={{ padding: '8px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  <option value="UNOPENED">Unopened / Resellable</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="DEFECTIVE">Defective</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            ))}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleReturn} style={{ backgroundColor: '#ef4444' }}>Confirm Return</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
