import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.PROD ? '/api' : 'http://127.0.0.1:5000/api';

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
            <div className="form-container animate-fade-in" style={{ maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                    <Link to="/" className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-secondary)' }}>
                        <ArrowLeft size={18} />
                    </Link>
                </div>

                <div className="text-center mb-8 mt-4">
                    <div style={{
                        display: 'inline-flex',
                        padding: '1.25rem',
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        borderRadius: '1.25rem',
                        color: 'white',
                        marginBottom: '1.25rem',
                        boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.3)'
                    }}>
                        <Shield size={32} />
                    </div>
                    <h2 className="mb-2">Leader Portal</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Secure authorization for community administration.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg flex items-center gap-3 animate-fade-in" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                        <AlertCircle size={20} />
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
                            placeholder="leader@evasu.org"
                        />
                    </div>

                    <div className="form-group mb-8">
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

                    <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ background: '#0f172a', py: '1rem' }}>
                        {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                    </button>

                    <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Restricted access. Authorized personnel only.
                    </p>
                </form>
            </div>
        </div>
    );
}
