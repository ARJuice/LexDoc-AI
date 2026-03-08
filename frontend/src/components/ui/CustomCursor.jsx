import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Custom cursor: modern pointer SVG + trailing blob/dot.
 * The pointer tracks the mouse exactly, the blob follows with a smooth GSAP delay.
 */
export default function CustomCursor() {
    const pointerRef = useRef(null);
    const blobRef = useRef(null);
    const isHovering = useRef(false);

    useEffect(() => {
        const pointer = pointerRef.current;
        const blob = blobRef.current;
        if (!pointer || !blob) return;

        // GSAP quickTo for buttery smooth following
        const xPointer = gsap.quickTo(pointer, 'x', { duration: 0.1, ease: 'power2.out' });
        const yPointer = gsap.quickTo(pointer, 'y', { duration: 0.1, ease: 'power2.out' });
        const xBlob = gsap.quickTo(blob, 'x', { duration: 0.45, ease: 'power3.out' });
        const yBlob = gsap.quickTo(blob, 'y', { duration: 0.45, ease: 'power3.out' });

        const onMouseMove = (e) => {
            xPointer(e.clientX);
            yPointer(e.clientY);
            xBlob(e.clientX);
            yBlob(e.clientY);
        };

        // Detect hoverable elements
        const onMouseOver = (e) => {
            const target = e.target.closest('button, a, [data-hoverable], .card, input, select, textarea, .btn');
            if (target && !isHovering.current) {
                isHovering.current = true;
                gsap.to(blob, { scale: 2.2, opacity: 0.35, duration: 0.3, ease: 'power2.out' });
                gsap.to(pointer, { scale: 0.8, duration: 0.3, ease: 'power2.out' });
            }
        };

        const onMouseOut = (e) => {
            const target = e.target.closest('button, a, [data-hoverable], .card, input, select, textarea, .btn');
            if (target && isHovering.current) {
                isHovering.current = false;
                gsap.to(blob, { scale: 1, opacity: 0.55, duration: 0.3, ease: 'power2.out' });
                gsap.to(pointer, { scale: 1, duration: 0.3, ease: 'power2.out' });
            }
        };

        const onMouseDown = () => {
            gsap.to(blob, { scale: 0.7, duration: 0.15 });
            gsap.to(pointer, { scale: 0.85, duration: 0.15 });
        };

        const onMouseUp = () => {
            gsap.to(blob, { scale: isHovering.current ? 2.2 : 1, duration: 0.25, ease: 'back.out(1.5)' });
            gsap.to(pointer, { scale: isHovering.current ? 0.8 : 1, duration: 0.25 });
        };

        window.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseover', onMouseOver);
        document.addEventListener('mouseout', onMouseOut);
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseover', onMouseOver);
            document.removeEventListener('mouseout', onMouseOut);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    return (
        <>
            {/* Trailing blob */}
            <div
                ref={blobRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'var(--cursor-blob-color)',
                    pointerEvents: 'none',
                    zIndex: 99998,
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.55,
                    filter: 'blur(1px)',
                    mixBlendMode: 'screen',
                }}
            />
            {/* Pointer icon */}
            <div
                ref={pointerRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    zIndex: 99999,
                    transform: 'translate(-4px, -2px)',
                }}
            >
                <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M1 1L1 18.5L5.5 14.5L9 22L12.5 20.5L9 13H15L1 1Z"
                        fill="var(--cursor-color)"
                        stroke="var(--color-bg)"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </>
    );
}
