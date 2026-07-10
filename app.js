document.addEventListener('DOMContentLoaded', () => {
    
    // --- Routing & Transitions ---
    const views = {
        landing: document.getElementById('view-landing'),
        main: document.getElementById('view-main'),
        hidden: document.getElementById('view-4pm')
    };

    function switchView(viewName) {
        // Fade out all
        Object.values(views).forEach(v => {
            v.classList.remove('active');
            setTimeout(() => {
                if (!v.classList.contains('active')) {
                    v.classList.add('hidden');
                }
            }, 1500); // Wait for transition
        });

        // Fade in target
        setTimeout(() => {
            views[viewName].classList.remove('hidden');
            // small delay to ensure display:none is gone before fading in
            setTimeout(() => {
                views[viewName].classList.add('active');
                window.scrollTo(0,0);
            }, 50);
        }, 1500);
    }

    // Hash routing
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash === '#main') {
            switchView('main');
        } else if (hash === '#4pm') {
            switchView('hidden');
        } else {
            switchView('landing');
        }
    });

    // Initial load route
    if (window.location.hash === '#main') {
        switchView('main');
    } else if (window.location.hash === '#4pm') {
        switchView('hidden');
    } else {
        // We start on landing by default as per HTML
    }

    // --- Enter Button Click ---
    const enterBtn = document.getElementById('enter-btn');
    enterBtn.addEventListener('click', (e) => {
        // Let hash routing handle it, but we can do it smoothly
    });

    const returnBtn = document.querySelector('.return-link');
    returnBtn.addEventListener('click', (e) => {
        // Let hash routing handle it
    });

    // --- Hidden View Keystroke Logic ---
    let keys = '';
    const secret = '/4pm';
    window.addEventListener('keydown', (e) => {
        // Don't capture when typing in journal
        if (e.target.tagName.toLowerCase() === 'textarea') return;

        keys += e.key.toLowerCase();
        if (keys.length > secret.length) {
            keys = keys.substring(1);
        }
        if (keys === secret) {
            window.location.hash = '4pm';
        }
    });

    // --- Section Scroll Animations ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '100px 0px 100px 0px'
    });

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // --- Tiny Journal LocalStorage ---
    const journalInput = document.getElementById('journal-input');
    const savedJournal = localStorage.getItem('4pm-journal');
    if (savedJournal) {
        journalInput.value = savedJournal;
    }

    journalInput.addEventListener('input', (e) => {
        localStorage.setItem('4pm-journal', e.target.value);
    });

    // --- Sunset Clock Logic ---
    function updateSunsetClock() {
        const now = new Date();
        const sunset = new Date();
        sunset.setHours(18, 42, 0, 0); // Hardcoded Golden Hour 18:42

        const clockEl = document.getElementById('sunset-clock');
        const diffMs = sunset - now;

        if (diffMs > 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            
            if (diffHours === 0 && diffMins === 0) {
                 clockEl.querySelector('.sunset-time').textContent = 'Sunset is now';
            } else if (diffHours > 0) {
                 clockEl.querySelector('.sunset-time').textContent = `Sunset in ${diffHours}h ${diffMins}m`;
            } else {
                 clockEl.querySelector('.sunset-time').textContent = `Sunset in ${diffMins}m`;
            }
        } else {
            clockEl.querySelector('.sunset-time').textContent = '18:42'; // Just show time if past
        }
    }
    
    updateSunsetClock();
    setInterval(updateSunsetClock, 60000); // update every minute

    // --- Audio Controls ---
    const soundBtns = document.querySelectorAll('.sound-btn');
    let currentlyPlaying = null;

    soundBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const soundType = btn.getAttribute('data-sound');
            const audioEl = document.getElementById(`audio-${soundType}`);

            // If clicking the currently playing sound, pause it
            if (currentlyPlaying === audioEl) {
                audioEl.pause();
                btn.classList.remove('playing');
                currentlyPlaying = null;
                return;
            }

            // Pause whatever is playing
            if (currentlyPlaying) {
                currentlyPlaying.pause();
                // Find active btn and remove class
                soundBtns.forEach(b => b.classList.remove('playing'));
            }

            // Play the new sound
            if (audioEl) {
                audioEl.volume = 0.5; // gentle volume
                audioEl.play().catch(e => {
                    console.log('Audio play failed', e);
                });
                btn.classList.add('playing');
                currentlyPlaying = audioEl;
            }
        });
    });

});
