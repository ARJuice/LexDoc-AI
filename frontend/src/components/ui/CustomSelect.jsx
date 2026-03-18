import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * A reusable Custom Select dropdown using the LexDoc Liquid Glass theme.
 * Replaces native `<select>` tags to provide consistent styling.
 * 
 * @param {string|number} value - Currently selected value.
 * @param {function} onChange - Callback when an option is selected.
 * @param {Array<{value: string|number, label: string}>} options - Dropdown items.
 * @param {string} [placeholder] - Default text if no value matches.
 * @param {React.ElementType} [icon] - Optional Lucide icon to display on the left.
 * @param {string} [className] - Additional wrapper classes.
 */
export default function CustomSelect({ value, onChange, options, placeholder = "Select...", icon: Icon, className = "" }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectedOption = options.find(o => String(o.value) === String(value));
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    return (
        <div ref={containerRef} className={`custom-select-container ${open ? 'open' : ''} ${className}`}>
            <button
                type="button"
                className="custom-select-trigger"
                onClick={() => setOpen(!open)}
                data-hoverable
            >
                {Icon && <Icon size={14} className="custom-select-icon" />}
                <span className="custom-select-label">{displayLabel}</span>
                <ChevronDown size={14} className={`custom-select-chevron ${open ? 'rotated' : ''}`} />
            </button>
            <div className={`custom-select-dropdown ${open ? 'visible' : ''}`}>
                {options.map((opt, i) => (
                    <button
                        key={i}
                        type="button"
                        className={`custom-select-item ${String(value) === String(opt.value) ? 'active' : ''}`}
                        onClick={() => { onChange(opt.value); setOpen(false); }}
                        data-hoverable
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
