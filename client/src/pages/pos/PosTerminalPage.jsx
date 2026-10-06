import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { posLookupBarcode, posLookupCustomer, posCheckout } from '../../services/pos/posApi.js';
import { Button, useToast, Tag } from '../../components/ui/index.js';

export default function PosTerminalPage() {
  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [paymentAmount, setPaymentAmount] = useState('');
  
  const barcodeRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    
    try {
      const data = await posLookupBarcode(barcode);
      setCart(prev => {
        const existing = prev.find(item => item.id === data.id);
        if (existing) {
          return prev.map(item => item.id === data.id ? { ...item, qty: item.qty + 1 } : item);
        }
        return [...prev, { ...data, qty: 1 }];
      });
      setBarcode('');
    } catch (err) {
      toast.push(err.message, 'error');
    }
    barcodeRef.current?.focus();
  };

  const handleCustomerLookup = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    
    try {
      const data = await posLookupCustomer(phone);
      setCustomer(data);
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  const addPayment = () => {
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) return;
    setPayments([...payments, { method: paymentMethod, amount: amt }]);
    setPaymentAmount('');
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.05; // Dummy tax
  const total = subtotal + tax;
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = total - paid;
  const change = paid > total ? paid - total : 0;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (balance > 0) {
      toast.push('Payment incomplete', 'error');
      return;
    }

    try {
      await posCheckout({
        items: cart,
        customerId: customer?.id,
        payments,
        issueStoreCredit: change > 0 // Simplified for demo
      });
      toast.push('Sale completed successfully!', 'success');
      // Reset
      setCart([]);
      setCustomer(null);
      setPhone('');
      setPayments([]);
      barcodeRef.current?.focus();
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', height: '100%' }}>
      
      {/* LEFT: CART */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#0f172a', padding: '24px', borderRadius: '16px' }}>
        <form onSubmit={handleScan} style={{ display: 'flex', gap: '8px' }}>
          <input 
            ref={barcodeRef}
            type="text" 
            value={barcode}
            onChange={e => setBarcode(e.target.value)}
            placeholder="Scan barcode or enter WADN..."
            style={{ flex: 1, padding: '16px', fontSize: '1.2rem', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px' }}
          />
          <Button type="submit">Add</Button>
        </form>

        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#1e293b', borderRadius: '8px', padding: '16px' }}>
          {cart.length === 0 ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '64px' }}>Cart is empty</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#334155', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{item.sku}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span>{item.qty} x ${item.price}</span>
                    <strong style={{ width: '80px', textAlign: 'right' }}>${(item.qty * item.price).toFixed(2)}</strong>
                    <Button variant="danger" onClick={() => setCart(cart.filter((_, i) => i !== idx))} style={{ padding: '4px 8px' }}>X</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button variant="secondary" onClick={() => navigate('/pos/return')}>Process Return</Button>
        </div>
      </div>

      {/* RIGHT: CHECKOUT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Customer Panel */}
        <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Customer</h3>
          {customer ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{customer.name}</div>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Credit: ${customer.credit_balance}</div>
              </div>
              <Button variant="secondary" onClick={() => setCustomer(null)}>Clear</Button>
            </div>
          ) : (
            <form onSubmit={handleCustomerLookup} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone number..."
                style={{ flex: 1, padding: '12px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px' }}
              />
              <Button type="submit">Find</Button>
            </form>
          )}
        </div>

        {/* Totals */}
        <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax (5%)</span><span>${tax.toFixed(2)}</span></div>
          <hr style={{ borderColor: '#334155', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold' }}><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>

        {/* Payments */}
        <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '16px', flex: 1 }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Payment</h3>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ padding: '12px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px' }}>
              <option value="CARD">Card</option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CREDIT">Store Credit</option>
            </select>
            <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="0.00" style={{ flex: 1, padding: '12px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px' }} />
            <Button onClick={addPayment}>Add</Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {payments.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#1e293b', borderRadius: '4px' }}>
                <Tag>{p.method}</Tag>
                <span>${p.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: balance > 0 ? '#f87171' : '#4ade80' }}>
            <span>{balance > 0 ? 'Balance Due' : 'Change Due'}</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${Math.abs(balance).toFixed(2)}</span>
          </div>

          <Button 
            onClick={handleCheckout} 
            disabled={cart.length === 0 || balance > 0} 
            style={{ width: '100%', padding: '16px', fontSize: '1.2rem', backgroundColor: balance <= 0 && cart.length > 0 ? '#22c55e' : '#334155' }}
          >
            Complete Sale
          </Button>
        </div>

      </div>
    </div>
  );
}
