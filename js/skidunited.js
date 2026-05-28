let searchData = [];

//tbf my ahh didnt come here for make a searchbar

// Initialize search by fetching the index

function initWikiSearch() {
    const path = window.location.pathname;
    const rootEndIndex = path.indexOf('/Omni/');
    const basePath = rootEndIndex !== -1 ? path.substring(0, rootEndIndex + 6) : '/';

    fetch(basePath + 'search-index.json')
        .then(r => {
            if (!r.ok) throw new Error('Could not load search index: ' + r.status);
            return r.json();
        })
        .then(data => {
            searchData = data;
            console.log('[wiki-search] loaded', searchData.length, 'pages');
        })
        .catch(err => console.error('[wiki-search] fetch failed:', err));

    const searchInput = document.getElementById('wiki-search');
    if (!searchInput) {
        console.error('[wiki-search] input element not found in DOM');
        return;
    }

    searchInput.addEventListener('input', runWikiSearch);
    searchInput.addEventListener('focus', runWikiSearch);

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            const box = document.getElementById('wiki-results');
            if (box) box.innerHTML = '';
        }
    });
}


// Executed every time a user types a letter
function runWikiSearch() {
    const input = document.getElementById('wiki-search');
    const resultsContainer = document.getElementById('wiki-results');
    if (!input || !resultsContainer) return;

    const query = input.value.trim().toLowerCase();

    if (!searchData.length) {
        resultsContainer.innerHTML = '<div style="padding:10px;">Loading…</div>';
        return;
    }

    const results = query === ''
        ? searchData.slice(0, 8)
        : searchData.filter(page => {
            const matchesTitle   = page.title.toLowerCase().includes(query);
            const matchesSnippet = String(page.snippet ?? '').toLowerCase().includes(query);
            const matchesTags    = page.tags.some(tag => tag.toLowerCase().includes(query));
            return matchesTitle || matchesSnippet || matchesTags;
        });

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div style="padding:10px; font-size:12px; color:#999;">No pages found</div>';
        return;
    }

    const path = window.location.pathname;
    const rootEndIndex = path.indexOf('/Omni/');
    const basePath = rootEndIndex !== -1 ? path.substring(0, rootEndIndex + 6) : '/';

    resultsContainer.innerHTML = results.map(page => {
        const cleanUrl = page.url.startsWith('/') ? page.url.substring(1) : page.url;
        const catHtml = page.categories?.length
            ? `<div class="wiki-categories">${page.categories.map(c => `<span class="wiki-cat">${c}</span>`).join('')}</div>`
            : '';
        return `<a href="${basePath}${cleanUrl}" class="search-item">
            <strong>${page.title}</strong>
            <span>${page.snippet ?? ''}</span>
            ${catHtml}
        </a>`;
    }).join('');
}

// Start loading data immediately when the DOM is ready
document.addEventListener('DOMContentLoaded', initWikiSearch);

// ═══════════════════════════════════════════
//  LAZY-LOAD VIDEOS (IntersectionObserver)
//  Add class="lazy-video" and data-src="path/to/video.mp4"
//  to any <video> element. The src is set only when the
//  video scrolls into view, saving bandwidth.
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
    const lazyVideos = document.querySelectorAll('video.lazy-video');
    if (!lazyVideos.length) return;

    // Use IntersectionObserver where supported (all modern browsers)
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    const src = video.getAttribute('data-src');
                    if (src) {
                        video.src = src;
                        video.removeAttribute('data-src');
                    }
                    observer.unobserve(video);
                }
            });
        }, {
            rootMargin: '200px' // start loading 200px before visible
        });

        lazyVideos.forEach(function (video) {
            observer.observe(video);
        });
    } else {
        // Fallback: load all videos immediately
        lazyVideos.forEach(function (video) {
            var src = video.getAttribute('data-src');
            if (src) {
                video.src = src;
                video.removeAttribute('data-src');
            }
        });
    }
});

// ═══════════════════════════════════════════
//  EASTER EGG: "duckless" SECRET MUSIC
// ═══════════════════════════════════════════
let typedKeys = '';
const secretWord = 'duckless';
let secretAudio = null;

document.addEventListener('keydown', function (e) {
    // Ignore key presses inside inputs or textareas
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
    }

    const path = window.location.pathname;
    const rootEndIndex = path.indexOf('/Omni/');
    const basePath = rootEndIndex !== -1 ? path.substring(0, rootEndIndex + 6) : '/';
    const isHomePage = path === basePath || path.endsWith('index.html') || path.endsWith('/');

    if (!isHomePage) return;

    if (e.key.length !== 1) return;

    typedKeys += e.key.toLowerCase();
    if (typedKeys.length > secretWord.length) {
        typedKeys = typedKeys.substring(typedKeys.length - secretWord.length);
    }

    if (typedKeys === secretWord) {
        if (!secretAudio) {
            secretAudio = new Audio(basePath + 'assests/secretmusic.mp3');
        }
        secretAudio.currentTime = 0;
        secretAudio.play().catch(err => console.error("Error playing secret music:", err));
        typedKeys = '';
    }
});

