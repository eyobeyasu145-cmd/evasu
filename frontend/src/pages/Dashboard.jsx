import React, { useEffect, useState } from 'react';
import { Users, LogOut, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('evasu_token');
            const response = await fetch(`${API_URL}/members`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('evasu_token');
                navigate('/leader-login');
                return;
            }

            const data = await response.json();
            if (response.ok) {
                setMembers(data);
            } else {
                setError(data.error || 'Failed to fetch members');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('evasu_token');
        navigate('/leader-login');
    };

    return (
        <div className="main-layout">
            {/* Sidebar */}
            <div className="sidebar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--primary-color)', borderRadius: '0.5rem', color: 'white' }}>
                        <Users size={24} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>EVASU Admin</h2>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="btn w-full" style={{ justifyContent: 'flex-start', backgroundColor: '#f1f5f9', color: 'var(--primary-color)' }}>
                        <Users size={18} style={{ marginRight: '0.5rem' }} /> Members List
                    </button>
                </nav>

                <button onClick={handleLogout} className="btn w-full text-error" style={{ justifyContent: 'flex-start', background: 'transparent' }}>
                    <LogOut size={18} style={{ marginRight: '0.5rem' }} /> Sign Out
                </button>
            </div>

            {/* Main Content */}
            <div className="content-area">
                <header className="glass-header" style={{ borderRadius: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Members Directory</h1>
                        <p className="text-sm text-secondary" style={{ margin: 0 }}>View and manage all registered members</p>
                    </div>
                    <div style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 600 }}>
                        Total Registered: {members.length}
                    </div>
                </header>

                {error && (
                    <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#fee2e2', color: 'var(--error)', marginBottom: '2rem' }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                        <Loader2 size={40} className="animate-spin" style={{ marginBottom: '1rem' }} />
                        <p>Loading member data...</p>
                    </div>
                ) : (
                    <div className="data-table-container">
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Member ID</th>
                                        <th>Full Name</th>
                                        <th>University ID</th>
                                        <th>Stream</th>
                                        <th>Year</th>
                                        <th>Phone</th>
                                        <th>Family</th>
                                        <th>Service</th>
                                        <th>Reg. Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member) => (
                                        <tr key={member.member_id}>
                                            <td className="font-semibold" style={{ color: 'var(--primary-color)' }}>{member.member_id}</td>
                                            <td className="font-semibold">{member.full_name}</td>
                                            <td>{member.university_id}</td>
                                            <td>{member.stream}</td>
                                            <td>{member.education_year}</td>
                                            <td>{member.phone_number}</td>
                                            <td>{member.family_name || <span style={{ color: '#cbd5e1' }}>Unassigned</span>}</td>
                                            <td>{member.service_name || <span style={{ color: '#cbd5e1' }}>Unassigned</span>}</td>
                                            <td>{new Date(member.registered_date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {members.length === 0 && (
                                        <tr>
                                            <td colSpan="9" className="text-center" style={{ padding: '3rem' }}>
                                                No members found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
