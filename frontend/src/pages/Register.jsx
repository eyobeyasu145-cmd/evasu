import React, { useState } from 'react';
import { UserPlus, Shield, CheckCircle2, AlertCircle, Phone, Fingerprint, MapPin, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import evasuLogo from '../assets/evasu.jpg';

const API_URL = 'http://127.0.0.1:5000/api';

export default function Register() {
    const [formData, setFormData] = useState({
        full_name: '', university_id: '', dorm: '', block: '', stream: '',
        section_id: '', region: '', sub_city: '', sex: 'Male',
        education_year: 'Freshman', phone_number: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch(`${API_URL}/members/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: 'Registration successful! Welcome to EVASU.' });
                setFormData({
                    full_name: '', university_id: '', dorm: '', block: '', stream: '',
                    section_id: '', region: '', sub_city: '', sex: 'Male',
                    education_year: 'Freshman', phone_number: ''
                });
            } else {
                setStatus({ type: 'error', message: data.error || 'Registration failed.' });
            }
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Connection error. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dynamic-gradient-bg">
            <div className="form-container" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                    <Link to="/leader-login" className="btn" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={16} /> Leader Access
                    </Link>
                </div>

                <div className="text-center mb-6">
                    <img
                        src={evasuLogo}
                        alt="EVASU Logo"
                        style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '4px solid white',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            marginBottom: '1rem'
                        }}
                    />
                    <h1>EVASU Community</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome to the official registration portal.</p>
                </div>

                {status.message && (
                    <div className="mb-6" style={{ padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: status.type === 'success' ? '#dcfce7' : '#fee2e2', color: status.type === 'success' ? 'var(--success)' : 'var(--error)' }}>
                        {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span className="font-semibold">{status.message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="form-input" required placeholder="John Doe" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">University ID</label>
                            <input type="text" name="university_id" value={formData.university_id} onChange={handleChange} className="form-input" required placeholder="DU12345" />
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Dorm Name</label>
                            <input type="text" name="dorm" value={formData.dorm} onChange={handleChange} className="form-input" required placeholder="e.g. Dorm A" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Block Number</label>
                            <input type="text" name="block" value={formData.block} onChange={handleChange} className="form-input" required placeholder="e.g. Block 3" />
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Stream (Department)</label>
                            <input type="text" name="stream" value={formData.stream} onChange={handleChange} className="form-input" required placeholder="Computer Science" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Section ID</label>
                            <input type="number" name="section_id" value={formData.section_id} onChange={handleChange} className="form-input" placeholder="e.g. 1" />
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Gender (Sex)</label>
                            <select name="sex" value={formData.sex} onChange={handleChange} className="form-select">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Education Year</label>
                            <select name="education_year" value={formData.education_year} onChange={handleChange} className="form-select">
                                <option value="Remedial">Remedial</option>
                                <option value="Freshman">Freshman</option>
                                <option value="2nd">2nd Year</option>
                                <option value="3rd">3rd Year</option>
                                <option value="4th">4th Year</option>
                                <option value="5th">5th Year</option>
                                <option value="GC">Graduate Class (GC)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Region</label>
                            <input type="text" name="region" value={formData.region} onChange={handleChange} className="form-input" placeholder="Oromia, Amhara, etc." />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Sub City / Zone</label>
                            <input type="text" name="sub_city" value={formData.sub_city} onChange={handleChange} className="form-input" placeholder="Dire Dawa, etc." />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="form-input" required placeholder="0912345678" />
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                        {loading ? 'Submitting Registration...' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
}
