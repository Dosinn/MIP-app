import { X } from 'lucide-react';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import './Modal.css';
import * as React from "react";
import {useEffect} from "react";

interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

function Modal({ title, onClose, children }: ModalProps) {

    useLockBodyScroll();

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <h3>{title}</h3>
                    <button className="closeButton" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="modalBody">{children}</div>
            </div>
        </div>
    );
}

export default Modal;