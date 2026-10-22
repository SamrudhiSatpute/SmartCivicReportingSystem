import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import CameraCapture from '../../components/CameraCapture';

export default function UserDashboard() {
    const { user } = useContext(AuthContext);
    
    // Form State
    const [category, setCategory] = useState('Pothole');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    
    // UI State
    const [issues, setIssues] = useState([]);
    const [message, setMessage] = useState('');
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch past reports when page loads
    useEffect(() => {
        fetchMyIssues();
    }, []);

    const fetchMyIssues = async () => {
        try {
            const response = await api.get(`/issues/user/${user.id}`);
            setIssues(response.data);
        } catch (error) {
            console.error("Failed to fetch issues", error);
        }
    };

    // Auto-fetch coordinates using browser GPS
    const handleGetLocation = () => {
        setLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLat(position.coords.latitude);
                    setLng(position.coords.longitude);
                    setLoadingLocation(false);
                    setMessage('Location captured successfully!');
                },
                (error) => {
                    setLoadingLocation(false);
                    setMessage('Please allow location access in your browser.');
                }
            );
        } else {
            setLoadingLocation(false);
            setMessage('Geolocation is not supported by your browser.');
        }
    };

    // Uploads a photo (from file picker or camera capture) to the backend
    // and stores the resulting public URL in imageUrl
    const handlePhotoUpload = async (file) => {
        if (!file) return;

        setUploadingPhoto(true);
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setImageUrl(response.data.url);
            setMessage('Photo added successfully!');
        } catch (error) {
            setMessage('Failed to upload photo. Please try again.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleFileSelected = (e) => {
        const file = e.target.files[0];
        handlePhotoUpload(file);
        e.target.value = ''; // allow re-selecting the same file later
    };

    const handleCameraCapture = (file) => {
        setShowCamera(false);
        handlePhotoUpload(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const newIssue = {
            category,
            description,
            imageUrl,
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        };

        try {
            // Backend returns { issue, duplicate, message } — if a nearby
            // report of the same category already exists, ours gets merged
            // into it instead of creating a new entry
            const response = await api.post(`/issues/report/${user.id}`, newIssue);
            setMessage(response.data.message);
            
            // Clear form and refresh list
            setDescription('');
            setImageUrl('');
            setLat('');
            setLng('');
            fetchMyIssues();
        } catch (error) {
            const backendMessage = error.response?.data;
            setMessage(typeof backendMessage === 'string' ? backendMessage : 'Failed to submit report. Please try again.');
        }
    };

    return (
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
            
            {/* Left Side: Reporting Form */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Report a Civic Issue</h3>
                
                {message && (
                    <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Issue Category</label>
                        <select 
                            className="form-control" 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="Pothole">Pothole</option>
                            <option value="Garbage">Garbage Dump</option>
                            <option value="Streetlight">Broken Streetlight</option>
                            <option value="Water Leak">Water Leak</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            className="form-control" 
                            rows="3" 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Photo Evidence (Optional)</label>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                            <button 
                                type="button" 
                                className="btn" 
                                style={{ backgroundColor: '#2c3e50', fontSize: '0.8rem' }}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPhoto}
                            >
                                📁 Upload Photo
                            </button>
                            <button 
                                type="button" 
                                className="btn" 
                                style={{ backgroundColor: '#2c3e50', fontSize: '0.8rem' }}
                                onClick={() => setShowCamera(true)}
                                disabled={uploadingPhoto}
                            >
                                📷 Open Camera
                            </button>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileSelected}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {uploadingPhoto && (
                            <p style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Uploading photo...</p>
                        )}

                        {imageUrl && !uploadingPhoto && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <img 
                                    src={imageUrl} 
                                    alt="Evidence preview" 
                                    style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '4px', border: '1px solid #e1e8ed', display: 'block' }} 
                                />
                                <button 
                                    type="button" 
                                    className="btn btn-danger" 
                                    style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}
                                    onClick={() => setImageUrl('')}
                                >
                                    Remove Photo
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Location Coordinates</label>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                            <input type="number" step="any" className="form-control" placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} required />
                            <input type="number" step="any" className="form-control" placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} required />
                        </div>
                        <button type="button" className="btn" onClick={handleGetLocation} style={{ backgroundColor: '#2c3e50', fontSize: '0.8rem' }}>
                            {loadingLocation ? 'Getting location...' : '📍 Auto-Detect My Location'}
                        </button>
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
                        Submit Report
                    </button>
                </form>
            </div>

            {/* Right Side: Issue History */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>My Recent Reports</h3>
                
                {issues.length === 0 ? (
                    <p style={{ color: '#7f8c8d' }}>You haven't reported any issues yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {issues.map((issue) => (
                            <div key={issue.id} style={{ padding: '1rem', border: '1px solid #e1e8ed', borderRadius: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong>{issue.category}</strong>
                                    <span style={{ 
                                        padding: '0.2rem 0.6rem', 
                                        borderRadius: '12px', 
                                        fontSize: '0.8rem',
                                        backgroundColor: issue.status === 'RESOLVED' ? '#d4edda' : '#fff3cd',
                                        color: issue.status === 'RESOLVED' ? '#155724' : '#856404'
                                    }}>
                                        {issue.status}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#34495e', marginBottom: '0.5rem' }}>{issue.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <small style={{ color: '#95a5a6' }}>
                                        Reported: {new Date(issue.createdAt).toLocaleDateString()}
                                    </small>
                                    {issue.reportCount > 1 && (
                                        <small style={{ color: '#e67e22', fontWeight: 'bold' }}>
                                            🔥 {issue.reportCount} citizens reported this
                                        </small>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showCamera && (
                <CameraCapture 
                    onCapture={handleCameraCapture} 
                    onClose={() => setShowCamera(false)} 
                />
            )}

        </div>
    );
}