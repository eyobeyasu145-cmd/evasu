import React, { useState } from 'react';
import {
    UserPlus, Shield, CheckCircle2, AlertCircle, Phone,
    Fingerprint, MapPin, GraduationCap, ChevronRight,
    ChevronLeft, Check, ClipboardCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import evasuLogo from '../assets/evasu.jpg';

const API_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') 
    ? (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:5000/api')
    : '/api';

const STEPS = [
    { id: 1, title: 'Personal', icon: UserPlus },
    { id: 2, title: 'Campus', icon: MapPin },
    { id: 3, title: 'Academic', icon: GraduationCap },
    { id: 4, title: 'Review', icon: ClipboardCheck }
];

export default function Register() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        full_name: '', university_id: '', dorm: '', block: '', stream: '',
        section_id: '', region: '', sub_city: '', sex: 'Male',
        education_year: 'Freshman', phone_number: ''
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const validateStep = (step) => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.full_name) newErrors.full_name = 'Full name is required';
            if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
            else if (!/^\d{10}$/.test(formData.phone_number.replace(/\s/g, ''))) {
                newErrors.phone_number = 'Enter a valid 10-digit phone number';
            }
        } else if (step === 2) {
            if (!formData.university_id) newErrors.university_id = 'University ID is required';
            if (!formData.dorm) newErrors.dorm = 'Dorm name is required';
            if (!formData.block) newErrors.block = 'Block number is required';
        } else if (step === 3) {
            if (!formData.stream) newErrors.stream = 'Stream/Department is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch(`${API_URL}/members/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: 'Registration successful! Welcome to EVASU.' });
                // Reset form and go back to step 1 after delay
                setTimeout(() => {
                    setFormData({
                        full_name: '', university_id: '', dorm: '', block: '', stream: '',
                        section_id: '', region: '', sub_city: '', sex: 'Male',
                        education_year: 'Freshman', phone_number: ''
                    });
                    setCurrentStep(1);
                    setStatus({ type: '', message: '' });
                }, 5000);
            } else {
                setStatus({ type: 'error', message: data.error || 'Registration failed.' });
                setCurrentStep(4); // Keep them on review step to see error
            }
        } catch (error) {
            console.error('Registration Fetch Error:', error);
            setStatus({ type: 'error', message: 'Connection error. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    const renderField = (label, name, type = 'text', placeholder = '', options = null) => (
        <div className="form-group">
            <label className="form-label">{label}</label>
            {options ? (
                <select name={name} value={formData[name]} onChange={handleChange} className={`form-select ${errors[name] ? 'invalid' : ''}`}>
                    {options.map(opt => <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={`form-input ${errors[name] ? 'invalid' : ''}`}
                    placeholder={placeholder}
                />
            )}
            {errors[name] && <span className="form-field-error">{errors[name]}</span>}
        </div>
    );

    return (
        <div className="dynamic-gradient-bg">
            <div className="form-container animate-fade-in">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <Link to="/leader-login" className="btn btn-ghost" style={{ fontSize: '0.875rem' }}>
                            <Shield size={16} style={{ marginRight: '0.5rem' }} /> Leader login
                        </Link>
                    </div>

                    <div className="text-center mb-8">
                        <img src={evasuLogo} alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1rem', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                        <h1 className="mb-2" style={{ fontSize: 'clamp(1.25rem, 5vw, 2rem)' }}>Dire Dawa EVASU Registration</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="form-progress">
                    <div className="progress-bar-fill" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}></div>
                    {STEPS.map(step => (
                        <div key={step.id} className={`step-indicator ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
                            {currentStep > step.id ? <Check size={16} /> : <step.icon size={16} />}
                        </div>
                    ))}
                </div>

                {status.message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-fade-in ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                        style={{ backgroundColor: status.type === 'success' ? '#dcfce7' : '#fee2e2', color: status.type === 'success' ? '#166534' : '#991b1b' }}>
                        {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        <span className="font-semibold">{status.message}</span>
                    </div>
                )}

                <div className="form-step-container">
                    {currentStep === 1 && (
                        <div className="form-step animate-fade-in">
                            <div className="form-grid">
                                {renderField('Full Name', 'full_name', 'text', 'John Doe')}
                                {renderField('Gender', 'sex', 'select', '', ['Male', 'Female'])}
                            </div>
                            <div className="form-grid">
                                {renderField('Region', 'region', 'text', 'Oromia')}
                                {renderField('Sub City / Zone', 'sub_city', 'text', 'Addis Ababa')}
                            </div>
                            {renderField('Phone Number', 'phone_number', 'tel', '0912345678')}
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="form-step animate-fade-in">
                            {renderField('University ID', 'university_id', 'text', 'DU12345')}
                            <div className="form-grid">
                                {renderField('Dorm Name', 'dorm', 'text', 'Dorm A')}
                                {renderField('Block Number', 'block', 'text', '3')}
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="form-step animate-fade-in">
                            {renderField('Stream (Department)', 'stream', 'text', 'Computer Science')}
                            <div className="form-grid">
                                {renderField('Section ID', 'section_id', 'number', '1')}
                                {renderField('Education Year', 'education_year', 'select', '', [
                                    'Remedial', 'Freshman', '2nd', '3rd', '4th', '5th', 'GC'
                                ])}
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="form-step animate-fade-in">
                            <h3 className="text-sm font-semibold mb-4 text-secondary">Please review your information</h3>
                            <div className="summary-card">
                                <div className="summary-row"><strong>Name:</strong> <span>{formData.full_name}</span></div>
                                <div className="summary-row"><strong>ID:</strong> <span>{formData.university_id}</span></div>
                                <div className="summary-row"><strong>Stream:</strong> <span>{formData.stream}</span></div>
                                <div className="summary-row"><strong>Phone:</strong> <span>{formData.phone_number}</span></div>
                                <div className="summary-row"><strong>Dorm:</strong> <span>{formData.dorm} (Block {formData.block})</span></div>
                            </div>
                            <p className="mt-4 text-sm text-secondary">By clicking complete, you agree to join the EVASU community.</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 mt-8">
                    {currentStep > 1 && status.type !== 'success' && (
                        <button onClick={prevStep} className="btn btn-ghost flex-1">
                            <ChevronLeft size={18} style={{ marginRight: '0.5rem' }} /> Back
                        </button>
                    )}

                    {currentStep < STEPS.length ? (
                        <button onClick={nextStep} className="btn btn-primary flex-1">
                            Next Step <ChevronRight size={18} style={{ marginLeft: '0.5rem' }} />
                        </button>
                    ) : (
                        status.type !== 'success' && (
                            <button onClick={handleSubmit} className="btn btn-primary flex-1" disabled={loading}>
                                {loading ? 'Processing...' : 'Complete Registration'}
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
