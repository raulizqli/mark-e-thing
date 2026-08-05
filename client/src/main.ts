// client/src/main.ts
import type { Session } from '@supabase/supabase-js';
import L from 'leaflet';
import {
  createSearch,
  downloadExport,
  getSearchAnalytics,
  getSearchStatus,
} from './api.js';
import { isSupabaseConfigured, supabase } from './supabase.js';
import './styles.css';

const DEFAULT_CENTER: L.LatLngExpression = [19.4326, -99.1332];
const DEFAULT_ZOOM = 13;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const map = L.map('map', { zoomControl: true }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
}).addTo(map);

const marker = L.marker(DEFAULT_CENTER, { draggable: true }).addTo(map);
const radiusCircle = L.circle(DEFAULT_CENTER, { radius: 1500 }).addTo(map);

const latDisplay = document.getElementById('lat-display')!;
const lngDisplay = document.getElementById('lng-display')!;
const radiusInput = document.getElementById('radius') as HTMLInputElement;
const radiusLabel = document.getElementById('radius-label')!;
const form = document.getElementById('search-form') as HTMLFormElement;
const locateBtn = document.getElementById('locate-btn') as HTMLButtonElement;
const searchBtn = document.getElementById('search-btn') as HTMLButtonElement;
const statusPanel = document.getElementById('status-panel')!;
const statusValue = document.getElementById('status-value')!;
const foundValue = document.getElementById('found-value')!;
const progressFill = document.getElementById('progress-fill')!;
const searchIdLabel = document.getElementById('search-id-label')!;
const exportActions = document.getElementById('export-actions')!;
const analyticsPanel = document.getElementById('analytics-panel')!;
const analyticsContent = document.getElementById('analytics-content')!;
const errorMessage = document.getElementById('error-message')!;
const authPanel = document.getElementById('auth-panel')!;
const sessionPanel = document.getElementById('session-panel')!;
const sessionEmail = document.getElementById('session-email')!;
const authMessage = document.getElementById('auth-message')!;
const googleBtn = document.getElementById('google-btn') as HTMLButtonElement;
const emailAuthForm = document.getElementById('email-auth-form') as HTMLFormElement;
const magicLinkBtn = document.getElementById('magic-link-btn') as HTMLButtonElement;
const signOutBtn = document.getElementById('sign-out-btn') as HTMLButtonElement;

let pollTimer: ReturnType<typeof setInterval> | null = null;
let activeSearchId: string | null = null;

function getCenter(): L.LatLng {
  return marker.getLatLng();
}

function updateCoordsDisplay(): void {
  const { lat, lng } = getCenter();
  latDisplay.textContent = lat.toFixed(6);
  lngDisplay.textContent = lng.toFixed(6);
}

function updateRadiusCircle(): void {
  const radius = Number(radiusInput.value);
  radiusLabel.textContent = String(radius);
  radiusCircle.setLatLng(getCenter());
  radiusCircle.setRadius(radius);
}

function setMarkerPosition(latlng: L.LatLngExpression): void {
  marker.setLatLng(latlng);
  updateCoordsDisplay();
  updateRadiusCircle();
}

function showError(message: string): void {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function clearError(): void {
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden');
}

function showAuthMessage(message: string): void {
  authMessage.textContent = message;
  authMessage.classList.remove('hidden');
}

function setSearching(active: boolean): void {
  searchBtn.disabled = active;
  locateBtn.disabled = active;
  searchBtn.textContent = active ? 'Searching…' : 'Start search';
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'badge badge-success';
    case 'FAILED':
      return 'badge badge-error';
    case 'PROCESSING':
      return 'badge badge-active';
    default:
      return 'badge';
  }
}

function renderAnalytics(
  data: Awaited<ReturnType<typeof getSearchAnalytics>>,
): void {
  const priorityRows = data.priorityDistribution
    .map(
      (row) =>
        `<div class="analytics-stat"><span>${row.priority}</span><strong>${row.count}</strong></div>`,
    )
    .join('');

  analyticsContent.innerHTML = `
    <div class="analytics-grid">
      <div class="analytics-stat"><span>Total</span><strong>${data.totalBusinesses}</strong></div>
      <div class="analytics-stat"><span>Analyzed</span><strong>${data.analyzedBusinesses}</strong></div>
      <div class="analytics-stat"><span>Avg score</span><strong>${data.averageLeadScore ?? '—'}</strong></div>
      <div class="analytics-stat"><span>With website</span><strong>${data.withWebsite}</strong></div>
      <div class="analytics-stat"><span>With email</span><strong>${data.withEmail}</strong></div>
      <div class="analytics-stat"><span>Valid SSL</span><strong>${data.withValidSsl}</strong></div>
    </div>
    <h3>Priority distribution</h3>
    <div class="analytics-grid">${priorityRows}</div>
  `;
  analyticsPanel.classList.remove('hidden');
}

function setupExportButtons(searchId: string): void {
  activeSearchId = searchId;
  exportActions.classList.remove('hidden');
}

function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

async function pollSearch(searchId: string): Promise<void> {
  try {
    const status = await getSearchStatus(searchId);
    statusValue.textContent = status.status;
    statusValue.className = statusBadgeClass(status.status);
    foundValue.textContent = String(status.totalFound);
    progressFill.style.width = `${status.progress}%`;

    if (status.status === 'COMPLETED') {
      stopPolling();
      setSearching(false);
      setupExportButtons(searchId);
      const analytics = await getSearchAnalytics(searchId);
      renderAnalytics(analytics);
    }

    if (status.status === 'FAILED') {
      stopPolling();
      setSearching(false);
      showError('Search failed. Check server logs for details.');
    }
  } catch (err) {
    stopPolling();
    setSearching(false);
    showError(err instanceof Error ? err.message : 'Status poll failed');
  }
}

function startPolling(searchId: string): void {
  stopPolling();
  void pollSearch(searchId);
  pollTimer = setInterval(() => {
    void pollSearch(searchId);
  }, 3000);
}

function setSignedIn(session: Session | null): void {
  const signedIn = Boolean(session);
  authPanel.classList.toggle('hidden', signedIn);
  sessionPanel.classList.toggle('hidden', !signedIn);
  form.classList.toggle('hidden', !signedIn);
  sessionEmail.textContent = session?.user.email ?? '—';
  if (!signedIn) {
    stopPolling();
    statusPanel.classList.add('hidden');
    analyticsPanel.classList.add('hidden');
    exportActions.classList.add('hidden');
  }
}

marker.on('dragend', () => {
  updateCoordsDisplay();
  updateRadiusCircle();
});

map.on('click', (event) => {
  setMarkerPosition(event.latlng);
});

radiusInput.addEventListener('input', updateRadiusCircle);

locateBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported in this browser.');
    return;
  }

  locateBtn.disabled = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latlng: L.LatLngExpression = [
        position.coords.latitude,
        position.coords.longitude,
      ];
      setMarkerPosition(latlng);
      map.setView(latlng, 15);
      locateBtn.disabled = false;
      clearError();
    },
    () => {
      showError('Could not get your location. Click the map to set a point.');
      locateBtn.disabled = false;
    },
  );
});

googleBtn.addEventListener('click', async () => {
  clearError();
  if (!isSupabaseConfigured()) {
    showError('Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env');
    return;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    showError(error.message);
  }
});

emailAuthForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();
  authMessage.classList.add('hidden');

  if (!isSupabaseConfigured()) {
    showError('Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env');
    return;
  }

  const email = (document.getElementById('auth-email') as HTMLInputElement).value.trim();
  magicLinkBtn.disabled = true;
  magicLinkBtn.textContent = 'Sending…';

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });

  magicLinkBtn.disabled = false;
  magicLinkBtn.textContent = 'Send magic link';

  if (error) {
    showError(error.message);
    return;
  }

  showAuthMessage(`Magic link sent to ${email}. Check your inbox.`);
});

signOutBtn.addEventListener('click', async () => {
  clearError();
  await supabase.auth.signOut();
});

exportActions.addEventListener('click', async (event) => {
  const target = event.target as HTMLElement;
  const button = target.closest('button[data-format]') as HTMLButtonElement | null;
  if (!button || !activeSearchId) {
    return;
  }

  const format = button.dataset.format as 'csv' | 'excel' | 'json';
  try {
    clearError();
    await downloadExport(activeSearchId, format);
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Export failed');
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();
  stopPolling();
  analyticsPanel.classList.add('hidden');
  exportActions.classList.add('hidden');

  const category = (document.getElementById('category') as HTMLInputElement).value.trim();
  const city = (document.getElementById('city') as HTMLInputElement).value.trim();
  const { lat, lng } = getCenter();
  const radiusMeters = Number(radiusInput.value);

  setSearching(true);
  statusPanel.classList.remove('hidden');

  try {
    const search = await createSearch({
      category,
      city: city || undefined,
      latitude: lat,
      longitude: lng,
      radiusMeters,
    });

    searchIdLabel.textContent = `Search ID: ${search.id}`;
    statusValue.textContent = search.status;
    statusValue.className = statusBadgeClass(search.status);
    foundValue.textContent = String(search.totalFound);
    progressFill.style.width = '0%';

    startPolling(search.id);
  } catch (err) {
    setSearching(false);
    showError(err instanceof Error ? err.message : 'Failed to start search');
  }
});

supabase.auth.onAuthStateChange((_event, session) => {
  setSignedIn(session);
});

void supabase.auth.getSession().then(({ data }) => {
  setSignedIn(data.session);
});

updateCoordsDisplay();
updateRadiusCircle();
