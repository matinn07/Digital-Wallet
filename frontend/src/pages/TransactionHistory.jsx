import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client.js';


const CATEGORIES = [
  '', // All
  'Bills',
  'Food',
  'Shopping',
  'Entertainment',
  'Travel',
  'Health',
  'Anonymous',
  'Other',
];

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const url = category ? `/transactions?category=${encodeURIComponent(category)}` : '/transactions';
        const data = await apiFetch(url);
        if (mounted) setTransactions(data.transactions || []);
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load transactions.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [category]);

  return (
    <div className="panel">
      <div style={{ fontWeight: 800, fontSize: 18 }}>Transaction History</div>
      <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>
        Credits, debits, and transfers recorded in `wallet_transactions`.
      </div>

      <div style={{ margin: '16px 0 8px 0' }}>
        <label style={{ marginRight: 8 }}>Filter by Category:</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All</option>
          {CATEGORIES.filter(c => c).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? <div style={{ marginTop: 14 }}>Loading...</div> : null}
      {error ? <div className="error">{error}</div> : null}

      {!loading ? (
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>From</th>
              <th>To</th>
              <th>Category</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ color: 'var(--muted)', padding: 14 }}>
                  {category ? 'No matching transactions for this category.' : 'No transactions yet.'}
                </td>
              </tr>
            ) : null}
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.type}</td>
                <td>{t.amount}</td>
                <td>{t.senderEmail || '-'}</td>
                <td>{t.receiverEmail || '-'}</td>
                <td>{t.category || '-'}</td>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}

