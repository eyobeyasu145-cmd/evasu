import React, { useEffect, useState } from 'react';
import { Users, ShieldAlert, LogOut, Loader2, PenSquare, Trash2, Check, X, UserCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') 
    ? (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:5000/api')
    : '/api';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('members');
    const [members, setMembers] = useState([]);
    const [leaders, setLeaders] = useState([]);
    const [roles, setRoles] = useState([]);
    const [families, setFamilies] = useState([]);
    const [services, setServices] = useState([]);

    // Assignment Modal State
    const [editingMember, setEditingMember] = useState(null);
    const [assignForm, setAssignForm] = useState({ family_id: '', service_id: '', leader_id: '' });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (activeTab === 'members') {
            fetchMembers();
            fetchAssignmentOptions(); // Fetch family and service lists
        }
        if (activeTab === 'leaders') fetchLeadersAndRoles();
    }, [activeTab]);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('evasu_token');
        if (!token) {
            navigate('/leader-login');
            return null;
        }
        return { 'Authorization': `Bearer ${token}` };
    };

    const fetchAssignmentOptions = async () => {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            const [famRes, servRes, leadRes] = await Promise.all([
                fetch(`${API_URL}/families`, { headers }),
                fetch(`${API_URL}/services`, { headers }),
                fetch(`${API_URL}/leaders`, { headers }) // Re-fetch leaders for dropdown
            ]);
            if (famRes.ok) setFamilies(await famRes.json());
            if (servRes.ok) setServices(await servRes.json());
            if (leadRes.ok) setLeaders(await leadRes.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMembers = async () => {
        setLoading(true);
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await fetch(`${API_URL}/members`, { headers });
            if (response.status === 401 || response.status === 403) return navigate('/leader-login');
            const data = await response.json();
            if (response.ok) setMembers(data);
            else setError(data.error || 'Failed to fetch members');
        } catch (err) { 
            console.error('Connection Error:', err);
            setError('Connection error'); 
        }
        finally { setLoading(false); }
    };

    const fetchLeadersAndRoles = async () => {
        setLoading(true);
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const [leadRes, roleRes] = await Promise.all([
                fetch(`${API_URL}/leaders`, { headers }),
                fetch(`${API_URL}/roles`, { headers })
            ]);

            if (leadRes.status === 401 || leadRes.status === 403) return navigate('/leader-login');

            if (leadRes.ok && roleRes.ok) {
                setLeaders(await leadRes.json());
                setRoles(await roleRes.json());
            } else {
                setError('Failed to fetch leaders data');
            }
        } catch (err) { 
            console.error('Connection Error:', err);
            setError('Connection error'); 
        }
        finally { setLoading(false); }
    };

    const toggleLeaderActive = async (leader) => {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            const response = await fetch(`${API_URL}/leaders/${leader.leader_id}`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...leader, is_active: !leader.is_active })
            });
            if (response.ok) fetchLeadersAndRoles();
        } catch (err) { setError('Failed to update leader status'); }
    };

    const deleteLeader = async (id) => {
        if (!window.confirm("Are you sure you want to delete this leader?")) return;
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            const response = await fetch(`${API_URL}/leaders/${id}`, { method: 'DELETE', headers });
            if (response.ok) fetchLeadersAndRoles();
            else alert('Failed to delete leader. They might be assigned to members.');
        } catch (err) { setError('Failed to delete leader'); }
    };

    const openAssignModal = (member) => {
        setAssignForm({
            family_id: member.family_id || '',
            service_id: member.service_id || '',
            leader_id: member.leader_id || ''
        });
        setEditingMember(member);
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await fetch(`${API_URL}/members/${editingMember.member_id}/assign`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    family_id: assignForm.family_id || null,
                    service_id: assignForm.service_id || null,
                    leader_id: assignForm.leader_id || null
                })
            });

            if (response.ok) {
                setEditingMember(null);
                fetchMembers(); // Refresh list to show new assignments
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to assign member.');
            }
        } catch (err) {
            setError('Connection error while assigning.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('evasu_token');
        navigate('/leader-login');
    };

    return (
        <div className="main-layout" style={{ position: 'relative' }}>
            {/* Assignment Modal Overlay */}
            {editingMember && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(8px)'
                }}>
                    <div className="form-container animate-fade-in" style={{ maxWidth: '500px', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', background: 'var(--primary-color)', borderRadius: '0.5rem', color: 'white' }}>
                                    <UserCog size={20} />
                                </div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Assign Roles</h2>
                            </div>
                            <button onClick={() => setEditingMember(null)} className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <p className="mb-6 text-sm text-secondary">Updating assignments for <strong>{editingMember.full_name}</strong> (ID: {editingMember.member_id})</p>

                        <form onSubmit={handleAssignSubmit}>
                            <div className="form-group">
                                <label className="form-label">Church Family</label>
                                <select
                                    className="form-select"
                                    value={assignForm.family_id}
                                    onChange={e => setAssignForm({ ...assignForm, family_id: e.target.value })}
                                >
                                    <option value="">-- No Family Selected --</option>
                                    {families.map(f => <option key={f.id} value={f.id}>{f.family_name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Service Department</label>
                                <select
                                    className="form-select"
                                    value={assignForm.service_id}
                                    onChange={e => setAssignForm({ ...assignForm, service_id: e.target.value })}
                                >
                                    <option value="">-- No Service Selected --</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                                </select>
                            </div>
                            <div className="form-group mb-8">
                                <label className="form-label">Assigned Leader</label>
                                <select
                                    className="form-select"
                                    value={assignForm.leader_id}
                                    onChange={e => setAssignForm({ ...assignForm, leader_id: e.target.value })}
                                >
                                    <option value="">-- No Leader Selected --</option>
                                    {leaders.map(l => <option key={l.leader_id} value={l.leader_id}>{l.full_name} ({l.email})</option>)}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" className="btn btn-ghost flex-1" onClick={() => setEditingMember(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div className="sidebar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--primary-color)', borderRadius: '0.5rem', color: 'white' }}>
                        <ShieldAlert size={24} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Dire Dawa EVASU</h2>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        onClick={() => setActiveTab('members')}
                        className="btn w-full"
                        style={{ justifyContent: 'flex-start', backgroundColor: activeTab === 'members' ? '#e0e7ff' : 'transparent', color: activeTab === 'members' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
                    >
                        <Users size={18} style={{ marginRight: '0.5rem' }} /> Members List
                    </button>
                    <button
                        onClick={() => setActiveTab('leaders')}
                        className="btn w-full"
                        style={{ justifyContent: 'flex-start', backgroundColor: activeTab === 'leaders' ? '#e0e7ff' : 'transparent', color: activeTab === 'leaders' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
                    >
                        <ShieldAlert size={18} style={{ marginRight: '0.5rem' }} /> Manage Leaders
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
                        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
                            {activeTab === 'members' ? 'Dire Dawa Members' : 'Dire Dawa Administration'}
                        </h1>
                        <p className="text-sm text-secondary" style={{ margin: 0 }}>
                            {activeTab === 'members' ? 'View and manage all registered members and their assignments.' : 'Manage system administrators and group leaders.'}
                        </p>
                    </div>
                    <div style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 600 }}>
                        Total {activeTab === 'members' ? 'Registered' : 'Leaders'}: {activeTab === 'members' ? members.length : leaders.length}
                    </div>
                </header>

                {error && (
                    <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#fee2e2', color: 'var(--error)', marginBottom: '2rem' }}>
                        {error}
                        <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                    </div>
                )}

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                        <Loader2 size={40} className="animate-spin" style={{ marginBottom: '1rem' }} />
                        <p>Loading data...</p>
                    </div>
                ) : (
                    <div className="data-table-container">
                        <div style={{ overflowX: 'auto' }}>
                            {activeTab === 'members' ? (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Member ID</th><th>Full Name</th><th>University ID</th>
                                            <th>Family</th><th>Service</th><th>Assigned Leader</th>
                                            <th>Manage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map((member) => (
                                            <tr key={member.member_id}>
                                                <td className="font-semibold" style={{ color: 'var(--primary-color)' }}>{member.member_id}</td>
                                                <td className="font-semibold">{member.full_name}</td>
                                                <td>{member.university_id}</td>
                                                <td>{member.family_name || <span style={{ color: '#cbd5e1' }}>Unassigned</span>}</td>
                                                <td>{member.service_name || <span style={{ color: '#cbd5e1' }}>Unassigned</span>}</td>
                                                <td>{member.leader_name || <span style={{ color: '#cbd5e1' }}>Unassigned</span>}</td>
                                                <td>
                                                    <button
                                                        onClick={() => openAssignModal(member)}
                                                        className="btn"
                                                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: '#e0e7ff', color: 'var(--primary-color)' }}
                                                    >
                                                        <UserCog size={14} style={{ marginRight: '0.25rem' }} /> Assign
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {members.length === 0 && (
                                            <tr><td colSpan="7" className="text-center" style={{ padding: '3rem' }}>No members found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th><th>Full Name</th><th>Role</th>
                                            <th>Email</th><th>Phone</th><th>Joined Date</th>
                                            <th>Status</th><th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaders.map((leader) => (
                                            <tr key={leader.leader_id}>
                                                <td className="font-semibold" style={{ color: 'var(--primary-color)' }}>{leader.leader_id}</td>
                                                <td className="font-semibold">{leader.full_name}</td>
                                                <td>{leader.role_name || <span style={{ color: '#cbd5e1' }}>Unassigned</span>}</td>
                                                <td>{leader.email}</td>
                                                <td>{leader.phone_number}</td>
                                                <td>{new Date(leader.joined_date).toLocaleDateString()}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '1rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        backgroundColor: leader.is_active ? '#dcfce7' : '#fee2e2',
                                                        color: leader.is_active ? '#166534' : '#991b1b'
                                                    }}>
                                                        {leader.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => toggleLeaderActive(leader)}
                                                            className="btn"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#f1f5f9' }}
                                                            title={leader.is_active ? "Deactivate" : "Activate"}
                                                        >
                                                            {leader.is_active ? <X size={14} color="var(--error)" /> : <Check size={14} color="var(--success)" />}
                                                        </button>
                                                        <button
                                                            onClick={() => deleteLeader(leader.leader_id)}
                                                            className="btn"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#fee2e2', color: 'var(--error)' }}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {leaders.length === 0 && (
                                            <tr><td colSpan="8" className="text-center" style={{ padding: '3rem' }}>No leaders found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
