import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, Modal, Pill, Skeleton, EmptyState, useToast } from '../../components/ui/index.js';
import { getAveroInventory, getAveroMovements, adjustAveroStock } from '../../services/avero/averoApi.js';

export default function InventoryPage() {
  const toast = useToast();
  const [tree, setTree] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'movements'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Adjustment Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTargetBatch, setAdjustTargetBatch] = useState(null);
  const [newStockQty, setNewStockQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [managerName, setManagerName] = useState('Vikram Joshi (Store Manager)');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invTree, movs] = await Promise.all([
        getAveroInventory(),
        getAveroMovements(),
      ]);
      setTree(invTree || []);
      setMovements(movs || []);
      if (invTree && invTree.length > 0 && !selectedProduct) {
        setSelectedProduct(invTree[0].product);
        setSelectedBatch(invTree[0].batches?.[0] || null);
      }
    } catch (err) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdjustModal = (batch, product) => {
    setAdjustTargetBatch({ ...batch, productName: product.name });
    setNewStockQty(String(batch.currentQty));
    setAdjustReason('Physical stock reconciliation audit discrepancy');
    setIsAdjustModalOpen(true);
  };

  const handleConfirmAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustTargetBatch) return;
    if (newStockQty === '' || isNaN(Number(newStockQty)) || Number(newStockQty) < 0) {
      toast.error('Please enter a valid non-negative quantity');
      return;
    }
    if (!adjustReason.trim()) {
      toast.error('Reason for adjustment is required for audit trail');
      return;
    }

    setIsSubmittingAdjust(true);
    try {
      await adjustAveroStock({
        batchId: adjustTargetBatch.id,
        newQty: Number(newStockQty),
        reason: adjustReason,
        managerName,
      });
      toast.success(`Adjusted stock for ${adjustTargetBatch.batchNumber} to ${newStockQty} units`);
      setIsAdjustModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  const categories = ['ALL', ...new Set(tree.map(t => t.product.category).filter(Boolean))];

  const filteredTree = tree.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batches.some(b => b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || item.product.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', color: '#173d35', fontWeight: 800 }}>3-Level Live Stock &amp; Batches</h1>
          <p style={{ color: '#5a6b61', marginTop: 4 }}>Loading products, batches &amp; serialized WADNs...</p>
        </div>
        <Card><CardContent><Skeleton className="h-96 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Top Header & Tab Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: '#e7e2d4', borderRadius: 999, fontSize: 12, fontWeight: 700, color: '#173d35', marginBottom: 8, border: '1px solid #d8ded0' }}>
            <span>📦 Product &bull; Batch &bull; WADN Unit Hierarchy</span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#173d35', margin: 0 }}>
            Live Inventory &amp; Movement Matrix
          </h1>
          <p style={{ color: '#5a6b61', fontSize: 14.5, marginTop: 4, margin: 0 }}>
            Trace physical stock across SKU masters, expiry batches, individual WADNs, and immutable movements.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, background: '#e7e2d4', padding: 4, borderRadius: 12, border: '1px solid #d8ded0' }}>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: '8px 16px',
              borderRadius: 9,
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'inventory' ? '#173d35' : 'transparent',
              color: activeTab === 'inventory' ? '#fffefb' : '#4a5a51',
              transition: 'all 0.18s ease',
            }}
          >
            📦 3-Level Stock Hierarchy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('movements')}
            style={{
              padding: '8px 16px',
              borderRadius: 9,
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'movements' ? '#173d35' : 'transparent',
              color: activeTab === 'movements' ? '#fffefb' : '#4a5a51',
              transition: 'all 0.18s ease',
            }}
          >
            📜 Movement Ledger ({movements.length})
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div style={{ display: 'grid', gap: 20 }}>
          {/* Filter Toolbar */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', background: '#fffefb', padding: '14px 18px', borderRadius: 16, border: '1px solid #d8ded0' }}>
            <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 Search by product name, SKU, or batch number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: 10,
                  border: '1px solid #d8ded0',
                  background: '#f6f3eb',
                  fontSize: 13.5,
                  color: '#173d35',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: `1px solid ${categoryFilter === cat ? '#173d35' : '#d8ded0'}`,
                    background: categoryFilter === cat ? '#173d35' : '#fffefb',
                    color: categoryFilter === cat ? '#fff' : '#4a5a51',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 3-Level Split View: Product List (Left) -> Batches & Units (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(400px, 1.4fr)', gap: 20 }}>
            {/* Level 1: Products */}
            <div style={{ background: '#fffefb', borderRadius: 18, border: '1px solid #d8ded0', padding: '18px', display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e7e2d4', paddingBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#173d35', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Level 1: Product Master ({filteredTree.length})
                </span>
                <span style={{ fontSize: 11, color: '#606d65' }}>Select product to inspect batches</span>
              </div>

              <div style={{ display: 'grid', gap: 8, maxHeight: '68vh', overflowY: 'auto', paddingRight: 4 }}>
                {filteredTree.map(({ product, totalQty, batches }) => {
                  const isSelected = selectedProduct?.id === product.id;
                  const isLow = totalQty <= (product.minStockThreshold || 10);
                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setSelectedBatch(batches[0] || null);
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        background: isSelected ? '#173d35' : '#f6f3eb',
                        color: isSelected ? '#fffefb' : '#173d35',
                        border: `1px solid ${isSelected ? '#173d35' : '#e2ded2'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: 14, display: 'block' }}>{product.name}</strong>
                          <span style={{ fontSize: 11.5, color: isSelected ? '#c4ded5' : '#606d65' }}>
                            {product.brand} &bull; SKU: {product.sku}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                            background: isSelected ? 'rgba(255,255,255,0.2)' : isLow ? '#fce8e6' : '#e6f4ea',
                            color: isSelected ? '#fff' : isLow ? '#c5221f' : '#137333',
                          }}>
                            {totalQty} {product.unit}s
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 11, alignItems: 'center' }}>
                        <span style={{ background: isSelected ? 'rgba(0,0,0,0.2)' : '#e7e2d4', padding: '2px 6px', borderRadius: 4 }}>
                          {batches.length} Batch{batches.length > 1 ? 'es' : ''}
                        </span>
                        {product.isSerialized && (
                          <span style={{ background: isSelected ? '#f5d65c' : '#fef7e0', color: isSelected ? '#173d35' : '#b06000', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                            WADN Serialized
                          </span>
                        )}
                        <span style={{ marginLeft: 'auto', fontWeight: 600 }}>₹{product.basePrice}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Level 2 & 3: Batches & WADNs for Selected Product */}
            {selectedProduct ? (
              <div style={{ display: 'grid', gap: 16 }}>
                {/* Level 2: Batches */}
                <div style={{ background: '#fffefb', borderRadius: 18, border: '1px solid #d8ded0', padding: '18px', display: 'grid', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e7e2d4', paddingBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#173d35', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Level 2: Active Batches for {selectedProduct.name}
                      </span>
                      <span style={{ fontSize: 12, color: '#606d65', display: 'block', marginTop: 2 }}>
                        Track manufacturing dates, expiry horizons, and supplier return deadlines
                      </span>
                    </div>
                  </div>

                  {(() => {
                    const currentProductBatches = tree.find(t => t.product.id === selectedProduct.id)?.batches || [];
                    if (currentProductBatches.length === 0) {
                      return <EmptyState title="No batches in stock" description="This product currently has zero active batches registered." />;
                    }

                    return (
                      <div style={{ display: 'grid', gap: 10 }}>
                        {currentProductBatches.map(b => {
                          const isSelectedBatch = selectedBatch?.id === b.id;
                          const isNearExp = b.daysToExpiry <= 5;
                          const isDistDeadlineNear = b.daysToDistReturn <= 3;
                          return (
                            <div
                              key={b.id}
                              onClick={() => setSelectedBatch(b)}
                              style={{
                                padding: '14px 16px',
                                borderRadius: 12,
                                background: isSelectedBatch ? '#fbf8f0' : '#f6f3eb',
                                border: `2px solid ${isSelectedBatch ? '#173d35' : '#e2ded2'}`,
                                cursor: 'pointer',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <strong style={{ fontSize: 14.5, color: '#173d35' }}>Batch: {b.batchNumber}</strong>
                                    {isDistDeadlineNear && (
                                      <span style={{ fontSize: 10.5, fontWeight: 800, background: '#fce8e6', color: '#c5221f', padding: '2px 6px', borderRadius: 4, border: '1px solid #fcdad4' }}>
                                        Vendor Return: {b.daysToDistReturn <= 0 ? 'CLOSING' : `${b.daysToDistReturn}d left`}
                                      </span>
                                    )}
                                    {isNearExp && (
                                      <span style={{ fontSize: 10.5, fontWeight: 800, background: '#fef7e0', color: '#b06000', padding: '2px 6px', borderRadius: 4, border: '1px solid #feefc3' }}>
                                        Exp: {b.daysToExpiry <= 0 ? 'EXPIRED' : `${b.daysToExpiry}d`}
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: 12, color: '#606d65', display: 'block', marginTop: 2 }}>
                                    Supplier: <strong>{b.supplierName || 'Primary Hub'}</strong> &bull; Cost: ₹{b.costPrice} &bull; MRP: ₹{b.mrp} &bull; Selling: ₹{b.sellingPrice}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: 11, color: '#606d65', display: 'block' }}>Current Stock</span>
                                    <strong style={{ fontSize: 15, color: '#173d35' }}>{b.currentQty} / {b.initialQty} units</strong>
                                  </div>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openAdjustModal(b, selectedProduct);
                                    }}
                                    style={{ fontSize: 11, padding: '4px 10px', background: '#fffefb', color: '#173d35', borderColor: '#d8ded0' }}
                                  >
                                    ⚙️ Adjust Stock
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Level 3: Serialized WADNs (if product is serialized) */}
                {selectedProduct.isSerialized && selectedBatch && (
                  <div style={{ background: '#fffefb', borderRadius: 18, border: '1px solid #d8ded0', padding: '18px', display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e7e2d4', paddingBottom: 10 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#173d35', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Level 3: WADN Individual Units ({selectedBatch.units?.length || 0} tracked)
                        </span>
                        <span style={{ fontSize: 12, color: '#606d65', display: 'block', marginTop: 2 }}>
                          Unit-level serial registration, warranty status, and ownership lifecycle
                        </span>
                      </div>
                    </div>

                    {(!selectedBatch.units || selectedBatch.units.length === 0) ? (
                      <div style={{ padding: 16, textAlign: 'center', color: '#606d65', fontSize: 13 }}>
                        No individual serialized WADN units tracked in this batch.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {selectedBatch.units.map(unit => {
                          let badgeBg = '#e6f4ea';
                          let badgeColor = '#137333';
                          if (unit.status === 'SOLD') { badgeBg = '#e8f0fe'; badgeColor = '#1a73e8'; }
                          else if (unit.status === 'INSPECTION' || unit.status === 'REPAIR') { badgeBg = '#fef7e0'; badgeColor = '#b06000'; }
                          else if (unit.status === 'DAMAGED' || unit.status === 'DISPOSED') { badgeBg = '#fce8e6'; badgeColor = '#c5221f'; }

                          return (
                            <div key={unit.id} style={{ padding: '10px 14px', background: '#f6f3eb', borderRadius: 10, border: '1px solid #e2ded2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <code style={{ fontSize: 12.5, fontWeight: 700, color: '#173d35', background: '#e7e2d4', padding: '2px 6px', borderRadius: 4 }}>
                                    {unit.wadn}
                                  </code>
                                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: badgeBg, color: badgeColor }}>
                                    {unit.status}
                                  </span>
                                </div>
                                <span style={{ fontSize: 11.5, color: '#606d65', display: 'block', marginTop: 3 }}>
                                  Serial: {unit.serialNumber} &bull; Warranty until: {unit.warrantyEnd ? new Date(unit.warrantyEnd).toLocaleDateString() : 'N/A'}
                                  {unit.ownerPhone && ` • Owner: ${unit.ownerPhone}`}
                                </span>
                              </div>
                              <span style={{ fontSize: 11, color: '#808f85' }}>
                                {unit.history?.length || 1} lifecycle event(s)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        /* Immutable Movement Ledger Tab */
        <div style={{ background: '#fffefb', borderRadius: 20, border: '1px solid #d8ded0', padding: '22px', display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#173d35' }}>Immutable Movement Ledger</h3>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: '#5a6b61' }}>
                Every change in physical stock is recorded as a permanent event with transition states.
              </p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', background: '#e7e2d4', color: '#173d35', borderRadius: 8 }}>
              {movements.length} Total Events
            </span>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {movements.map(m => (
              <div key={m.id} style={{ padding: '12px 16px', background: '#f6f3eb', borderRadius: 12, border: '1px solid #e2ded2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 13.5, color: '#173d35' }}>{m.movementNumber}</strong>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 4, background: '#173d35', color: '#fff' }}>
                      {m.movementType}
                    </span>
                    <span style={{ fontSize: 12, color: '#606d65' }}>
                      {new Date(m.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#173d35', marginTop: 3 }}>
                    <strong>{m.qty}x</strong> {m.productName} ({m.batchNumber}) &bull; Transition: <code style={{ background: '#e7e2d4', padding: '1px 5px', borderRadius: 4 }}>{m.fromState}</code> &rarr; <code style={{ background: '#e7e2d4', padding: '1px 5px', borderRadius: 4 }}>{m.toState}</code>
                  </div>
                  <div style={{ fontSize: 12, color: '#5a6b61', marginTop: 2 }}>
                    Reason: {m.reason} {m.notes ? `• ${m.notes}` : ''}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: '#808f85', display: 'block' }}>Performed by</span>
                  <strong style={{ fontSize: 12.5, color: '#173d35' }}>{m.performedBy}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Manager Stock Adjustment with Audit Logging"
      >
        {adjustTargetBatch && (
          <form onSubmit={handleConfirmAdjustment} style={{ display: 'grid', gap: 16 }}>
            <div style={{ background: '#f6f3eb', padding: '12px 14px', borderRadius: 10, fontSize: 13, border: '1px solid #e2ded2' }}>
              <div>Product: <strong>{adjustTargetBatch.productName}</strong></div>
              <div>Batch: <strong>{adjustTargetBatch.batchNumber}</strong></div>
              <div>Current Quantity: <strong>{adjustTargetBatch.currentQty} units</strong></div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#173d35', marginBottom: 6 }}>
                New Verified Physical Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={newStockQty}
                onChange={(e) => setNewStockQty(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #d8ded0',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#173d35',
                  background: '#fffefb',
                  outline: 'none',
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#173d35', marginBottom: 6 }}>
                Adjustment Reason / Audit Justification *
              </label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Physical inventory count discrepancy, breakage found on shelf"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #d8ded0',
                  fontSize: 13.5,
                  color: '#173d35',
                  background: '#fffefb',
                  outline: 'none',
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#173d35', marginBottom: 6 }}>
                Authorizing Manager Name *
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #d8ded0',
                  fontSize: 13.5,
                  color: '#173d35',
                  background: '#fffefb',
                  outline: 'none',
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setIsAdjustModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmittingAdjust}
                style={{ background: '#173d35', color: '#fffefb', fontWeight: 700 }}
              >
                {isSubmittingAdjust ? 'Recording Movement...' : 'Confirm & Commit Movement'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
