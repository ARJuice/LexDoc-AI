import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import cursorPng from '../../assets/icons8-select-cursor-100.png';

/**
 * Custom cursor: PNG pointer with smooth trailing motion.
 */
export default function CustomCursor() {
    const pointerRef = useRef(null);
    const isHovering = useRef(false);

    useEffect(() => {
        const pointer = pointerRef.current;
        if (!pointer) return;

        const xPointer = gsap.quickTo(pointer, 'x', { duration: 0.08, ease: 'power2.out' });
        const yPointer = gsap.quickTo(pointer, 'y', { duration: 0.08, ease: 'power2.out' });

        const onMouseMove = (e) => {
            xPointer(e.clientX);
            yPointer(e.clientY);
        };

        const onMouseOver = (e) => {
            const target = e.target.closest('button, a, [data-hoverable], .card, input, select, textarea, .btn');
            if (target && !isHovering.current) {
                isHovering.current = true;
                gsap.to(pointer, { scale: 1.12, duration: 0.25, ease: 'power2.out' });
            }
        };

        const onMouseOut = (e) => {
            const target = e.target.closest('button, a, [data-hoverable], .card, input, select, textarea, .btn');
            if (target && isHovering.current) {
                isHovering.current = false;
                gsap.to(pointer, { scale: 1, duration: 0.25, ease: 'power2.out' });
            }
        };

        const onMouseDown = () => {
            gsap.to(pointer, { scale: 0.92, duration: 0.12 });
        };

        const onMouseUp = () => {
            gsap.to(pointer, { scale: isHovering.current ? 1.12 : 1, duration: 0.2, ease: 'back.out(1.4)' });
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
        <div
            ref={pointerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 2147483647,
                width: 24,
                height: 24,
                backgroundColor: 'var(--cursor-color)',
                opacity: 1,
                WebkitMaskImage: `url(${cursorPng})`,
                maskImage: `url(${cursorPng})`,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                transform: 'translate(-2px, -2px)',
                filter: 'drop-shadow(0 1px 4px rgba(0, 0, 0, 0.5)) brightness(1.25)',
            }}
        />
    );
}
