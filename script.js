const API_KEY = '';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const WATCHLIST_KEY = 'cinephile_watchlist';
const REGION = 'IN';

let watchlist = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
let currentMovieId = null;

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const moviesGrid = document.getElementById('moviesGrid');
const skeletonGrid = document.getElementById('skeletonGrid');
const emptyState = document.getElementById('emptyState');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalPoster = document.getElementById('modalPoster');
const modalTitle = document.getElementById('modalTitle');
const modalRating = document.getElementById('modalRating');
const modalYear = document.getElementById('modalYear');
const modalOverview = document.getElementById('modalOverview');
const trailerWrap = document.getElementById('trailerWrap');
const trailerFrame = document.getElementById('trailerFrame');
const trailerBtn = document.getElementById('trailerBtn');
const castGrid = document.getElementById('castGrid');
const watchlistBtn = document.getElementById('watchlistBtn');
const providersGrid = document.getElementById('providersGrid');

function showSkeleton() {
    emptyState.classList.add('hidden');
    if (skeletonGrid) skeletonGrid.removeAttribute('hidden');
    moviesGrid.querySelectorAll('.movie-card').forEach(c => c.remove());
}

function hideSkeleton() {
    if (skeletonGrid) skeletonGrid.setAttribute('hidden', '');
}

function setEmpty(empty) {
    if (empty) {
        emptyState.classList.remove('hidden');
        hideSkeleton();
    } else {
        emptyState.classList.add('hidden');
    }
}

function renderMovies(list) {
    hideSkeleton();
    moviesGrid.querySelectorAll('.movie-card').forEach(c => c.remove());
    if (!list || list.length === 0) {
        setEmpty(true);
        return;
    }
    setEmpty(false);
    list.forEach(movie => {
        const card = document.createElement('article');
        card.className = 'movie-card';
        card.dataset.id = movie.id;
        const posterUrl = movie.poster_path ? IMAGE_BASE + movie.poster_path : '';
        const rating = movie.vote_average != null ? movie.vote_average.toFixed(1) : '—';
        const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
        const isInWatchlist = watchlist.includes(movie.id);
        card.innerHTML = `
            <div class="movie-card-poster">
                ${posterUrl ? `<img src="${posterUrl}" alt="${escapeHtml(movie.title)}" loading="lazy">` : ''}
                <div class="movie-card-gradient"></div>
                <div class="movie-card-info">
                    <h3 class="movie-card-title">${escapeHtml(movie.title)}</h3>
                    <div class="movie-card-meta">
                        <span class="rating-badge">★ ${rating}</span>
                        ${year ? `<span>${year}</span>` : ''}
                    </div>
                </div>
                ${isInWatchlist ? '<span class="movie-watch-flag">●</span>' : ''}
            </div>
        `;
        card.addEventListener('click', () => openModal(movie.id));
        moviesGrid.appendChild(card);
    });
    refreshWatchlistMarkers();
}

function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
}

async function loadTrending() {
    showSkeleton();
    const sub = document.getElementById('sectionSubtitle');
    if (sub) sub.textContent = 'Popular on TMDB this week';
    try {
        const data = await fetchJson(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
        renderMovies(data.results || []);
    } catch {
        setEmpty(true);
        hideSkeleton();
    }
}

async function search(query) {
    const q = (query || '').trim();
    if (!q) {
        loadTrending();
        return;
    }
    showSkeleton();
    const sub = document.getElementById('sectionSubtitle');
    if (sub) sub.textContent = `Results for “${q}”`;
    try {
        const data = await fetchJson(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}`);
        renderMovies(data.results || []);
    } catch {
        setEmpty(true);
        hideSkeleton();
    }
}

function getTrailerVideo(results) {
    if (!results.length) return null;
    const youtube = results.filter(v => v.site === 'YouTube');
    const official = youtube.find(v => v.official && (v.type === 'Trailer' || (v.type || '').toLowerCase() === 'trailer'));
    if (official) return official;
    const trailer = youtube.find(v => (v.type || '').toLowerCase() === 'trailer');
    if (trailer) return trailer;
    const teaser = youtube.find(v => (v.type || '').toLowerCase() === 'teaser');
    return teaser || youtube[0] || null;
}

function openTrailer() {
    const key = trailerBtn.dataset.trailerKey;
    if (!key) return;
    trailerWrap.classList.remove('hidden');
    trailerFrame.src = `https://www.youtube.com/embed/${key}?autoplay=1&rel=0&modestbranding=1`;
    trailerBtn.classList.add('hidden');
}

function openModal(id) {
    currentMovieId = id;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    trailerWrap.classList.add('hidden');
    trailerFrame.src = '';
    trailerBtn.classList.add('hidden');
    trailerBtn.removeAttribute('data-trailer-key');
    castGrid.innerHTML = '';
    if (providersGrid) providersGrid.innerHTML = '';
    loadMovieDetails(id);
}

function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    trailerFrame.src = '';
    trailerWrap.classList.add('hidden');
    trailerBtn.classList.add('hidden');
}

async function loadMovieDetails(id) {
    try {
        const [movie, credits, videos, providers] = await Promise.all([
            fetchJson(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`),
            fetchJson(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`),
            fetchJson(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`),
            fetchJson(`${BASE_URL}/movie/${id}/watch/providers?api_key=${API_KEY}`)
        ]);
        const posterUrl = movie.poster_path ? IMAGE_BASE + movie.poster_path : '';
        modalPoster.src = posterUrl;
        modalPoster.alt = movie.title;
        modalTitle.textContent = movie.title;
        modalRating.textContent = movie.vote_average != null ? `★ ${movie.vote_average.toFixed(1)}` : '';
        modalYear.textContent = movie.release_date ? movie.release_date.slice(0, 4) : '';
        modalOverview.textContent = movie.overview || 'No overview available.';
        const trailer = getTrailerVideo(videos.results || []);
        if (trailer && trailer.key) {
            trailerBtn.classList.remove('hidden');
            trailerBtn.dataset.trailerKey = trailer.key;
        } else {
            trailerBtn.classList.add('hidden');
            trailerBtn.removeAttribute('data-trailer-key');
        }
        const cast = credits.cast || [];
        cast.forEach(person => {
            const card = document.createElement('div');
            card.className = 'cast-card';
            const imgUrl = person.profile_path ? IMAGE_BASE + person.profile_path : '';
            card.innerHTML = `
                <div class="cast-card-img-wrap">
                    ${imgUrl ? `<img src="${imgUrl}" alt="${escapeHtml(person.name)}" loading="lazy">` : ''}
                </div>
                <div class="cast-card-name">${escapeHtml(person.name)}</div>
                <div class="cast-card-char">${escapeHtml(person.character || '')}</div>
            `;
            castGrid.appendChild(card);
        });
        renderProviders(providers, REGION);
        updateWatchlistButton(id);
    } catch {
        modalOverview.textContent = 'Could not load details.';
    }
}

function refreshWatchlistMarkers() {
    document.querySelectorAll('.movie-card').forEach(card => {
        const id = Number(card.dataset.id);
        const flag = card.querySelector('.movie-watch-flag');
        const active = watchlist.includes(id);
        if (!flag && active) {
            const span = document.createElement('span');
            span.className = 'movie-watch-flag';
            span.textContent = '●';
            const poster = card.querySelector('.movie-card-poster');
            if (poster) poster.appendChild(span);
        } else if (flag && !active) {
            flag.remove();
        }
    });
}

function updateWatchlistButton(id) {
    if (!watchlistBtn) return;
    const active = watchlist.includes(id);
    watchlistBtn.classList.toggle('is-active', active);
    watchlistBtn.textContent = active ? 'Remove from watchlist' : 'Add to watchlist';
}

function toggleWatchlist() {
    if (!currentMovieId) return;
    const index = watchlist.indexOf(currentMovieId);
    if (index > -1) {
        watchlist.splice(index, 1);
    } else {
        watchlist.push(currentMovieId);
    }
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    updateWatchlistButton(currentMovieId);
    refreshWatchlistMarkers();
}

function renderProviders(data, region) {
    if (!providersGrid) return;
    providersGrid.innerHTML = '';
    const results = data.results || {};
    const entry = results[region] || results.US || results.IN || null;
    if (!entry) {
        providersGrid.textContent = 'No data';
        return;
    }
    const groups = entry.flatrate || entry.rent || entry.buy || [];
    if (!groups.length) {
        providersGrid.textContent = 'No data';
        return;
    }
    groups.forEach(p => {
        const div = document.createElement('div');
        div.className = 'provider-chip';
        const logo = p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : '';
        div.innerHTML = logo
            ? `<img src="${logo}" alt="${escapeHtml(p.provider_name)}" loading="lazy"><span>${escapeHtml(p.provider_name)}</span>`
            : `<span>${escapeHtml(p.provider_name)}</span>`;
        providersGrid.appendChild(div);
    });
}

modalClose.addEventListener('click', closeModal);
modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
trailerBtn.addEventListener('click', openTrailer);
if (watchlistBtn) {
    watchlistBtn.addEventListener('click', toggleWatchlist);
}
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
});

searchBtn.addEventListener('click', () => search(searchInput.value));
searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') search(searchInput.value);
});
document.getElementById('logoLink').addEventListener('click', (e) => {
    e.preventDefault();
    searchInput.value = '';
    loadTrending();
});
document.getElementById('closeTrailerBtn').addEventListener('click', () => {
    trailerWrap.classList.add('hidden');
    trailerFrame.src = '';
    if (trailerBtn.dataset.trailerKey) trailerBtn.classList.remove('hidden');
});

loadTrending();
