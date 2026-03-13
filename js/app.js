const SOURCES = [
  {
    name: 'Talos Intelligence',
    getUrl: (ip) =>
      `https://talosintelligence.com/reputation_center/lookup?search=${encodeURIComponent(ip)}`,
  },
  {
    name: 'VirusTotal',
    getUrl: (ip) => `https://www.virustotal.com/gui/ip-address/${encodeURIComponent(ip)}`,
  },
  {
    name: 'GreyNoise',
    getUrl: (ip) => `https://viz.greynoise.io/ip/${encodeURIComponent(ip)}`,
  },
  {
    name: 'AbuseIPDB',
    getUrl: (ip) => `https://www.abuseipdb.com/check/${encodeURIComponent(ip)}`,
  },
  {
    name: 'IPVoid',
    getUrl: (ip) => `https://www.ipvoid.com/scan/${encodeURIComponent(ip)}/`,
  },
  {
    name: 'Shodan',
    getUrl: (ip) => `https://www.shodan.io/host/${encodeURIComponent(ip)}`,
  },
];

const ipInput = document.getElementById('ipInput');
const inputHint = document.getElementById('inputHint');
const submitBtn = document.getElementById('submitBtn');
const searchForm = document.getElementById('searchForm');
const sourceList = document.getElementById('sourceList');

/** Escape for safe use in HTML to prevent XSS. */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/** Simple IPv4 validation; allow IPv6. */
function isValidIP(value) {
  const v4 =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])$/;
  const v6 =
    /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$/;
  const trimmed = value.trim();
  return trimmed.length > 0 && (v4.test(trimmed) || v6.test(trimmed));
}

function setHint(message, isError) {
  inputHint.textContent = message || '';
  inputHint.className = 'input-hint' + (isError ? ' error' : message ? ' ok' : '');
}

function setInputValid(valid) {
  ipInput.classList.toggle('error', !valid);
}

ipInput.addEventListener('input', () => {
  const v = ipInput.value.trim();
  if (!v) {
    setHint('');
    setInputValid(true);
    return;
  }
  const valid = isValidIP(v);
  setInputValid(valid);
  setHint(valid ? 'Valid IP' : 'Enter a valid IPv4 or IPv6 address', !valid);
  updateSourceLinks();
});

ipInput.addEventListener('blur', () => {
  if (!ipInput.value.trim()) setHint('');
  updateSourceLinks();
});

function openAllTabs(ip) {
  const urls = SOURCES.map((s) => s.getUrl(ip));
  urls.forEach((url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const ip = ipInput.value.trim();
  if (!ip) {
    setHint('Enter an IP address', true);
    setInputValid(false);
    ipInput.focus();
    return;
  }
  if (!isValidIP(ip)) {
    setHint('Enter a valid IPv4 or IPv6 address', true);
    setInputValid(false);
    ipInput.focus();
    return;
  }
  setHint('');
  setInputValid(true);
  openAllTabs(ip);
});

// Update each source link's href so the browser shows the URL in the status bar on hover
function updateSourceLinks() {
  const ip = ipInput.value.trim();
  const hasValidIp = ip && isValidIP(ip);
  sourceList.querySelectorAll('a[data-index]').forEach((a) => {
    const i = parseInt(a.getAttribute('data-index'), 10);
    if (Number.isNaN(i) || i < 0 || i >= SOURCES.length) return;
    const source = SOURCES[i];
    a.href = hasValidIp ? source.getUrl(ip) : '#';
  });
}

// Render source list (real links so status bar shows URL on hover; open in new tab)
function renderSourceList() {
  sourceList.innerHTML = SOURCES.map(
    (s, i) =>
      `<li><a href="#" data-index="${i}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.name)}</a></li>`
  ).join('');

  sourceList.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', (e) => {
      const ip = ipInput.value.trim();
      if (!ip || !isValidIP(ip)) {
        e.preventDefault();
        setHint('Enter a valid IP first', true);
        setInputValid(false);
        ipInput.focus();
        return;
      }
      const i = parseInt(a.getAttribute('data-index'), 10);
      if (Number.isNaN(i) || i < 0 || i >= SOURCES.length) e.preventDefault();
    });
  });

  updateSourceLinks();
}

renderSourceList();
