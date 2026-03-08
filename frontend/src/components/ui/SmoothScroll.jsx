import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';

/**
 * Provides Lenis smooth scrolling for the entire app.
 * Syncs with GSAP ticker for scroll-linked animations.
 */
export default function SmoothScroll({ children }) {
    const lenisRef = useRef(null);

    useEffect(() => {
        const tickerCallback = (time) => {
            lenis.raf(time * 1000);
        };

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
            allowNestedScroll: true,
            prevent: (node) => node?.closest?.('[data-lenis-prevent]'),
        });

        lenisRef.current = lenis;

        // Sync Lenis with GSAP ticker
        gsap.ticker.add(tickerCallback);
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            gsap.ticker.remove(tickerCallback);
        };
    }, []);

    return <>{children}</>;
}
