import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

const emptyForm = {
    title: '',
    description: '',
    category: '',
    location: '',
    budget: '',
    status: 'OPEN'
};

const statusBadgeStyle = (status) => ({
    padding: '0.3rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    backgroundColor: status === 'OPEN' ? '#d4edda' : '#f8d7da',
    color: status === 'OPEN' ? '#155724' : '#721c24'
});

export default function Jobs() {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'ADMIN';

    const [jobs, setJobs] = useState([]);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs/all');
            const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setJobs(sorted);
        } catch (error) {
            console.error('Failed to fetch jobs', error);
        }
    };

    const flashMessage = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(''), 3000);
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...form,
            budget: form.budget === '' ? null : parseFloat(form.budget)
        };

        try {
            if (editingId) {
                await api.put(`/jobs/${editingId}`, payload);
                flashMessage('Job/Contract updated successfully!');
            } else {
                await api.post('/jobs', payload);
                flashMessage('Job/Contract posted successfully!');
            }
            resetForm();
            fetchJobs();
        } catch (error) {
            flashMessage('Failed to save job/contract.');
        }
    };

    const handleEdit = (job) => {
        setEditingId(job.id);
        setForm({
            title: job.title || '',
            description: job.description || '',
            category: job.category || '',
            location: job.location || '',
            budget: job.budget ?? '',
            status: job.status || 'OPEN'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job/contract?')) return;

        try {
            await api.delete(`/jobs/${id}`);
            flashMessage('Job/Contract deleted.');
            fetchJobs();
        } catch (error) {
            flashMessage('Failed to delete job/contract.');
        }
    };

    return (
        <div className="container" style={{ marginTop: '2rem' }}>

            {message && (
                <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: '2rem' }}>

                {/* Admin-only: Create / Edit form */}
                {isAdmin && (
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem' }}>
                            {editingId ? `Edit Contract #${editingId}` : 'Post a New Contract'}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="form-control"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    rows="3"
                                    value={form.description}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    className="form-control"
                                    placeholder="e.g. Road Repair, Sanitation"
                                    value={form.category}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    className="form-control"
                                    value={form.location}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Budget</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="budget"
                                    className="form-control"
                                    value={form.budget}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    className="form-control"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="OPEN">Open</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn" style={{ flex: 1 }}>
                                    {editingId ? 'Update Contract' : 'Post Contract'}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={resetForm}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* Job/Contract listing, visible to everyone */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Available Contracts</h3>

                    {jobs.length === 0 ? (
                        <p style={{ color: '#7f8c8d' }}>No contracts available right now.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {jobs.map((job) => (
                                <div key={job.id} style={{ padding: '1rem', border: '1px solid #e1e8ed', borderRadius: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <strong>{job.title}</strong>
                                        <span style={statusBadgeStyle(job.status)}>{job.status}</span>
                                    </div>

                                    <p style={{ fontSize: '0.9rem', color: '#34495e', marginBottom: '0.5rem' }}>
                                        {job.description}
                                    </p>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
                                        {job.category && <span>📂 {job.category}</span>}
                                        {job.location && <span>📍 {job.location}</span>}
                                        {job.budget != null && <span>💰 ₹{job.budget}</span>}
                                    </div>

                                    <small style={{ color: '#95a5a6' }}>
                                        Posted: {new Date(job.createdAt).toLocaleDateString()}
                                    </small>

                                    {isAdmin && (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                            <button
                                                className="btn"
                                                style={{ backgroundColor: '#f39c12', fontSize: '0.8rem' }}
                                                onClick={() => handleEdit(job)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                style={{ fontSize: '0.8rem' }}
                                                onClick={() => handleDelete(job.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
