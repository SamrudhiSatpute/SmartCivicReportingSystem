import { useRef, useEffect, useState } from 'react';

// A small modal that opens the device camera (via getUserMedia) and lets the
// user snap a photo, which is handed back to the caller as a File object.
export default function CameraCapture({ onCapture, onClose }) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError('Camera access is not supported in this browser.');
            return;
        }

        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: 'environment' } })
            .then((stream) => {
                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(() => {
                setError('Could not access the camera. Please check permissions.');
            });

        return () => {
            cancelled = true;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        const video = videoRef.current;
        if (!video || !video.videoWidth) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                onCapture(file);
            }
        }, 'image/jpeg', 0.9);
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h3 style={{ marginBottom: '1rem' }}>Take a Photo</h3>

                {error ? (
                    <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: '100%', borderRadius: '4px', backgroundColor: '#000' }}
                    />
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    {!error && (
                        <button type="button" className="btn" style={{ flex: 1 }} onClick={handleCapture}>
                            📸 Capture
                        </button>
                    )}
                    <button type="button" className="btn btn-danger" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
};

const modalStyle = {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '480px'
};
