class CookieConsent {
    constructor() {
        this.init();
    }

    init() {
        this.checkConsent();
        this.attachEventListeners();
    }

    checkConsent() {
        const consent = localStorage.getItem('cookieConsent');
        
        if (!consent) {
            // Show banner if no consent given
            setTimeout(() => {
                document.getElementById('cookieConsent').style.display = 'block';
            }, 1000); // Show after 1 second
        } else {
            // Apply saved preferences
            const preferences = JSON.parse(consent);
            this.applyCookiePreferences(preferences);
        }
    }

    attachEventListeners() {
        // Accept all cookies
        document.getElementById('acceptCookies').addEventListener('click', () => {
            this.acceptAllCookies();
        });

        // Decline non-essential cookies
        document.getElementById('declineCookies').addEventListener('click', () => {
            this.declineOptionalCookies();
        });

        // Open settings modal
        document.getElementById('cookieSettings').addEventListener('click', () => {
            this.openSettingsModal();
        });

        // Close settings modal
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        // Save custom settings
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveCustomSettings();
        });

        // Close modal when clicking outside
        document.getElementById('cookieModal').addEventListener('click', (e) => {
            if (e.target.id === 'cookieModal') {
                this.closeSettingsModal();
            }
        });
    }

    acceptAllCookies() {
        const preferences = {
            essential: true,
            analytics: true,
            advertising: true,
            timestamp: Date.now()
        };

        this.savePreferences(preferences);
        this.applyCookiePreferences(preferences);
        this.hideBanner();
    }

    declineOptionalCookies() {
        const preferences = {
            essential: true,
            analytics: false,
            advertising: false,
            timestamp: Date.now()
        };

        this.savePreferences(preferences);
        this.applyCookiePreferences(preferences);
        this.hideBanner();
    }

    openSettingsModal() {
        // Load current preferences
        const consent = localStorage.getItem('cookieConsent');
        if (consent) {
            const preferences = JSON.parse(consent);
            document.getElementById('analyticsCookies').checked = preferences.analytics;
            document.getElementById('advertisingCookies').checked = preferences.advertising;
        } else {
            // Default to enabled for new users
            document.getElementById('analyticsCookies').checked = true;
            document.getElementById('advertisingCookies').checked = true;
        }

        document.getElementById('cookieModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeSettingsModal() {
        document.getElementById('cookieModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    saveCustomSettings() {
        const preferences = {
            essential: true, // Always true
            analytics: document.getElementById('analyticsCookies').checked,
            advertising: document.getElementById('advertisingCookies').checked,
            timestamp: Date.now()
        };

        this.savePreferences(preferences);
        this.applyCookiePreferences(preferences);
        this.closeSettingsModal();
        this.hideBanner();
    }

    savePreferences(preferences) {
        localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    }

    applyCookiePreferences(preferences) {
        // Load Google Analytics if analytics cookies are enabled
        if (preferences.analytics) {
            this.loadGoogleAnalytics();
        }

        // Load Google AdSense if advertising cookies are enabled
        if (preferences.advertising) {
            this.loadGoogleAdSense();
        }

        // You can add more cookie-dependent services here
    }

    loadGoogleAnalytics() {
        // Only load if not already loaded
        if (window.gtag) return;

        // Google Analytics tracking code
        const script1 = document.createElement('script');
        script1.async = true;
        script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-9NWDB6NP54';
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9NWDB6NP54', {
                page_title: document.title,
                page_location: window.location.href
            });
        `;
        document.head.appendChild(script2);
    }

    loadGoogleAdSense() {
        // Only load if not already loaded
        if (window.adsbygoogle) return;

        // Google AdSense script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5777587918363886';
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);

        // Initialize AdSense
        script.onload = () => {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        };
    }

    hideBanner() {
        document.getElementById('cookieConsent').style.display = 'none';
    }

    // Method to check if specific cookie type is allowed
    static isAllowed(cookieType) {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) return false;
        
        const preferences = JSON.parse(consent);
        return preferences[cookieType] === true;
    }

    // Method to revoke consent (for privacy page link)
    static revokeConsent() {
        localStorage.removeItem('cookieConsent');
        location.reload();
    }
}

// Initialize cookie consent when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CookieConsent();
});

// Expose helper functions globally
window.CookieConsent = CookieConsent;