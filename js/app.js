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
});

ipInput.addEventListener('blur', () => {
  if (!ipInput.value.trim()) setHint('');
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

// Render source list (links open that single source with current IP on click)
function renderSourceList() {
  sourceList.innerHTML = SOURCES.map(
    (s, i) =>
      `<li><a href="#" data-index="${i}" title="Open ${s.name} with entered IP">${s.name}</a></li>`
  ).join('');

  sourceList.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const ip = ipInput.value.trim();
      if (!ip || !isValidIP(ip)) {
        setHint('Enter a valid IP first', true);
        setInputValid(false);
        ipInput.focus();
        return;
      }
      const i = parseInt(a.getAttribute('data-index'), 10);
      const source = SOURCES[i];
      if (source) window.open(source.getUrl(ip), '_blank', 'noopener,noreferrer');
    });
  });
}

renderSourceList();
