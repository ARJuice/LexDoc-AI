import React, { useEffect, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import './ReAuthModal.css';

export default function ReAuthModal({ isOpen, onClose, onConfirm, actionName }) {
    const { session } = useAuth();
    const modalRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
            gsap.fromTo(modalRef.current, 
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.2)' }
            );
        }
    }, [isOpen]);

    const handleConfirm = () => {
        // Here we could implement actual Supabase reauth if needed later by calling signInWithOAuth
        // but for now, since session is valid and we just need UX confirmation:
        onConfirm();
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div ref={overlayRef} className="reauth-overlay">
            <div ref={modalRef} className="reauth-modal liquid-glass-card">
                <div className="reauth-header">
                    <ShieldCheck size={32} className="reauth-icon" />
                    <h2>Security Verification</h2>
                </div>
                
                <div className="reauth-body">
                    <p>You are about to perform a sensitive action:</p>
                    <p className="reauth-action-name">{actionName}</p>
                    <p className="reauth-subtext">Please confirm your identity to proceed safely.</p>
                </div>

                <div className="reauth-actions">
                    <button className="liquid-glass-btn secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="liquid-glass-btn primary" onClick={handleConfirm}>
                        Continue as {session?.user?.email}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
