// =============================================
// LexDoc AI — Centralized GSAP Animation Helpers
// =============================================
import gsap from 'gsap';

/**
 * Fade in and slide up an element or array of elements.
 */
export const fadeInUp = (elements, options = {}) => {
    const { delay = 0, duration = 0.6, stagger = 0, y = 24 } = options;
    return gsap.fromTo(elements,
        { opacity: 0, y },
        { opacity: 1, y: 0, duration, delay, stagger, ease: 'power3.out' }
    );
};

/**
 * Fade in with scale effect (for modals, cards).
 */
export const scaleIn = (element, options = {}) => {
    const { delay = 0, duration = 0.4, scale = 0.95 } = options;
    return gsap.fromTo(element,
        { opacity: 0, scale },
        { opacity: 1, scale: 1, duration, delay, ease: 'back.out(1.4)' }
    );
};

/**
 * Stagger children entering a container.
 */
export const staggerChildren = (container, childSelector, options = {}) => {
    const { delay = 0, stagger = 0.08, y = 20 } = options;
    const children = typeof container === 'string'
        ? document.querySelectorAll(`${container} ${childSelector}`)
        : container.querySelectorAll(childSelector);
    return fadeInUp(children, { delay, stagger, y });
};

/**
 * Page enter animation.
 */
export const pageEnter = (container) => {
    if (!container) return;
    return gsap.fromTo(container,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
};

/**
 * Page exit animation (for route transitions).
 */
export const pageExit = (container) => {
    if (!container) return;
    return gsap.to(container, {
        opacity: 0, y: -12, duration: 0.3, ease: 'power2.in'
    });
};

/**
 * Sidebar expand/collapse animation.
 */
export const animateSidebar = (element, collapsed) => {
    if (!element) return;
    const width = collapsed ? 72 : 260;
    return gsap.to(element, {
        width, duration: 0.4, ease: 'power2.inOut'
    });
};

/**
 * Modal overlay + content animation.
 */
export const animateModal = (overlay, content, show) => {
    if (show) {
        gsap.to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        scaleIn(content, { delay: 0.1 });
    } else {
        gsap.to(content, { opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in' });
        gsap.to(overlay, { opacity: 0, duration: 0.3, delay: 0.1, ease: 'power2.in' });
    }
};

/**
 * Progress bar animation (for upload states).
 */
export const animateProgress = (element, targetPercent, duration = 0.8) => {
    if (!element) return;
    return gsap.to(element, {
        width: `${targetPercent}%`,
        duration,
        ease: 'power2.out'
    });
};

/**
 * Number counter animation (for stat cards).
 */
export const animateCounter = (element, endValue, options = {}) => {
    const { duration = 1.2, delay = 0 } = options;
    const obj = { val: 0 };
    return gsap.to(obj, {
        val: endValue,
        duration,
        delay,
        ease: 'power2.out',
        onUpdate: () => {
            if (element) element.textContent = Math.round(obj.val);
        }
    });
};
