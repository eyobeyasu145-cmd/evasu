import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:5000/api';

export default function LeaderLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('evasu_token', data.token);
                navigate('/dashboard');
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (error) {
            console.error(error);
            setError('Server connection failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dynamic-gradient-bg" style={{ animationDuration: '20s' }}>
            <div className="form-container" style={{ maxWidth: '400px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
                    <Link to="/" className="btn" style={{ padding: '0', color: 'var(--text-secondary)' }}>
                        <ArrowLeft size={20} />
                    </Link>
                </div>

                <div className="text-center mb-6 mt-4">
                    <div style={{ display: 'inline-flex', padding: '1rem', background: '#0f172a', borderRadius: '50%', color: 'white', marginBottom: '1rem' }}>
                        <Shield size={32} />
                    </div>
                    <h2>Leader Portal</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Secure access to member management.</p>
                </div>

                {error && (
                    <div className="mb-6" style={{ padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fee2e2', color: 'var(--error)' }}>
                        <AlertCircle size={18} />
                        <span className="font-semibold text-sm">{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={16} /> Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            required
                            placeholder="admin@evasu.org"
                        />
                    </div>

                    <div className="form-group mb-6">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Lock size={16} /> Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ background: '#0f172a' }}>
                        {loading ? 'Authenticating...' : 'Secure Authorization'}
                    </button>
                </form>
            </div>
        </div>
    );
}
