// Common utility functions for AlgoPuzzleBoard

// Helper: addClass with support for multiple classes
function addClass(element, ...classes) {
    if (element) {
        element.classList.add(...classes);
    }
}

// Helper: removeClass with support for multiple classes
function removeClass(element, ...classes) {
    if (element) {
        element.classList.remove(...classes);
    }
}

// Helper: toggleClass
function toggleClass(element, className) {
    if (element) {
        element.classList.toggle(className);
    }
}

// Helper: sleep/delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: fetch with error handling
async function fetchJSON(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Helper: create element with properties
function createElement(tag, props = {}, ...children) {
    const element = document.createElement(tag);

    Object.keys(props).forEach(key => {
        if (key === 'className') {
            element.className = props[key];
        } else if (key === 'style' && typeof props[key] === 'object') {
            Object.assign(element.style, props[key]);
        } else if (key.startsWith('on') && typeof props[key] === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), props[key]);
        } else {
            element.setAttribute(key, props[key]);
        }
    });

    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child) {
            element.appendChild(child);
        }
    });

    return element;
}

// Export for modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addClass,
        removeClass,
        toggleClass,
        sleep,
        fetchJSON,
        createElement
    };
}

// Sidebar handling
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
}

function updateMobileVisibility() {
    const isMobile = window.innerWidth <= 768;
    const mobileHeader = document.querySelector('.mobile-header');
    const closeBtn = document.querySelector('.sidebar-header button');

    if (mobileHeader) mobileHeader.style.display = isMobile ? 'flex' : 'none';
    if (closeBtn) closeBtn.style.display = isMobile ? 'block' : 'none';
}

// Initialize responsive behavior
document.addEventListener('DOMContentLoaded', () => {
    updateMobileVisibility();
    window.addEventListener('resize', updateMobileVisibility);
});
