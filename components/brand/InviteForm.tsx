'use client';

import { useState } from 'react';

export function InviteForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    setEmail('');
  }

  if (sent) {
    return (
      <div
        style={{
          margin: '36px auto 0',
          maxWidth: 460,
          padding: '14px 18px',
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 999,
          textAlign: 'center',
          fontSize: 14,
          color: 'var(--ink)'
        }}
      >
        Thanks — we&rsquo;ll be in touch within two weeks.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ margin: '36px auto 0', maxWidth: 460, display: 'flex', gap: 8 }}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@goodtaste.com"
        style={{
          flex: 1,
          padding: '14px 18px',
          border: '1px solid var(--line-2)',
          borderRadius: 999,
          background: 'var(--paper)'
        }}
      />
      <button type="submit" className="btn btn-primary">Request invite →</button>
    </form>
  );
}
