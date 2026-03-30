import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client.js';


const CATEGORIES = [
  'Food',
  'Bills',
  'Shopping',
  'Entertainment',
  'Travel',
  'Health',
  'Other',
];

export default function SendMoney() {
  const [toEmail, setToEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const data = await apiFetch('/transfer', {
        method: 'POST',
        body: JSON.stringify({ toEmail, amount, category }),
      });
      setSuccess(`Transfer created: ${data.transactionId}`);
      navigate('/transactions');
    } catch (err) {
      setError(err.message || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div style={{ fontWeight: 800, fontSize: 18 }}>Send Money</div>
      <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>
        Uses a single SERIALIZABLE DB transaction: debit sender + credit receiver.
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
        <div style={{ marginTop: 12 }}>
          <label>Recipient Email</label>
          <input value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="recipient@example.com" />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Amount (USD)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 25.50" />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {error ? <div className="error">{error}</div> : null}
        {success ? <div style={{ marginTop: 10, color: 'var(--accent)' }}>{success}</div> : null}

        <div className="actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Transferring...' : 'Transfer'}
          </button>
        </div>
      </form>
    </div>
  );
}

