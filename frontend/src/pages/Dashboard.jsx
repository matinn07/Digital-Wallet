import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client.js';

export default function Dashboard() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addSuccess, setAddSuccess] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch('/balance');
        if (mounted) setBalance(data);
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load balance.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function onAddMoney(e) {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);
    setAddLoading(true);
    try {
      await apiFetch('/add-money', {
        method: 'POST',
        body: JSON.stringify({ amount: addAmount }),
      });
      setAddSuccess('Money added successfully.');
      setAddAmount('');
      // Refresh balance after successful credit.
      const data = await apiFetch('/balance');
      setBalance(data);
    } catch (err) {
      setAddError(err.message || 'Failed to add money.');
    } finally {
      setAddLoading(false);
    }
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Your Balance</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>Private wallet balance (DB locked on transfers).</div>
        </div>
      </div>

      {loading ? <div style={{ marginTop: 16 }}>Loading...</div> : null}
      {error ? <div className="error">{error}</div> : null}

      {balance ? (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 0.2 }}>{balance.balance}</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>
            Balance cents: {balance.balanceCents}
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: 18, borderTop: '1px solid rgba(168, 179, 214, 0.15)', paddingTop: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>Add Money</div>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>
          Credits your wallet using the same transaction model (but no daily limit applies to credits).
        </div>

        <form onSubmit={onAddMoney} style={{ marginTop: 12 }}>
          <label>Amount (USD)</label>
          <input value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="e.g. 50.00" />

          {addError ? <div className="error">{addError}</div> : null}
          {addSuccess ? <div style={{ marginTop: 10, color: 'var(--accent)' }}>{addSuccess}</div> : null}

          <div className="actions">
            <button type="submit" disabled={addLoading || !addAmount}>
              {addLoading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

