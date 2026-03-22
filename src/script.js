const API_KEY = '5ab4a19016cc4f4ab1135823262402';

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const setBar = (id, rawPct) => {
  const pct = clamp(Number(rawPct) || 0, 0, 100);
  const bar = document.getElementById(id);
  if (bar) bar.style.width = `${pct}%`;
};

const setText = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
};

const getUVLabel = (uv) => {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
};

const getPressureLabel = (pressure) => {
  if (pressure < 1000) return 'Low';
  if (pressure > 1020) return 'High';
  return 'Normal';
};

const getHumidityLabel = (humidity) => {
  if (humidity < 30) return 'Dry';
  if (humidity < 60) return 'Comfortable';
  return 'Humid';
};

const getAQILabel = (aqi) => {
  if (aqi <= 1) return 'Good';
  if (aqi <= 2) return 'Moderate';
  if (aqi <= 3) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 4) return 'Unhealthy';
  return 'Very Unhealthy';
};

async function fetchWeather(city = 'London') {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=1&aqi=yes`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const json = await res.json();
    if (!json || !json.current || !json.location) throw new Error('Invalid API response');
    updateWeatherUI(json);
  } catch (err) {
    console.error('Weather fetch failed:', err);
    setText('hero-condition', 'Data unavailable');
  }
}

function updateWeatherUI(data) {
  const { current, location, forecast } = data;
  const uv = Number(current.uv) || 0;
  const clouds = Number(current.cloud) || 0;
  const pressure = Number(current.pressure_mb) || 0;
  const humidity = Number(current.humidity) || 0;
  const wind = Number(current.wind_kph) || 0;
  const gusts = Number(current.gust_kph) || 0;
  const aqi = current.air_quality && Number(current.air_quality['us-epa-index']) ? Number(current.air_quality['us-epa-index']) : 0;

  console.log('[weather] uv=', uv, 'cloud=', clouds, 'pressure=', pressure, 'humidity=', humidity, 'aqi=', aqi);

  setText('hero-temp', `${Math.round(current.temp_c)}°`);
  setText('hero-condition', current.condition?.text || 'Unknown');
  setText('hero-range', `H: ${Math.round(forecast.forecastday[0].day.maxtemp_c)}° · L: ${Math.round(forecast.forecastday[0].day.mintemp_c)}°`);
  setText('hero-location', `${location.name}, ${location.country}`);
  setText('feels-like', `${Math.round(current.feelslike_c)}°`);

  setText('stat-uv', uv);
  setText('uv-label', getUVLabel(uv));
  setBar('uv-bar', clamp((uv / 11) * 100, 0, 100));

  setText('stat-clouds', clouds);
  setText('cloud-label', `${Math.round(clouds)}%`);
  setBar('cloud-bar', clamp(clouds, 0, 100));

  setText('stat-pressure', Math.round(pressure));
  setText('pressure-label', getPressureLabel(pressure));
  setBar('pressure-bar', clamp(((pressure - 950) / 100) * 100, 0, 100));

  setText('stat-humidity', humidity);
  setText('humidity-label', getHumidityLabel(humidity));
  setBar('humidity-bar', clamp(humidity, 0, 100));

  setText('stat-wind', `${Math.round(wind)} km/h`);
  setText('stat-winddir', current.wind_dir || 'N/A');
  setText('stat-gusts', `${Math.round(gusts)} km/h`);

  setText('aqi-value', aqi);
  setText('aqi-badge', getAQILabel(aqi));
  setBar('aqi-bar', clamp((aqi / 5) * 100, 0, 100));
  setText('aqi-pm25', Math.round(current.air_quality?.pm2_5 || 0));
  setText('aqi-pm10', Math.round(current.air_quality?.pm10 || 0));
  setText('aqi-o3', Math.round(current.air_quality?.o3 || 0));
}

function init() {
  const citySearch = document.getElementById('city-search');
  if (citySearch) {
    citySearch.addEventListener('keypress', (event) => {
      if (event.key === 'Enter' && citySearch.value.trim()) {
        fetchWeather(citySearch.value.trim());
      }
    });
  }

  const celsiusBtn = document.getElementById('celsius-btn');
  const fahrenheitBtn = document.getElementById('fahrenheit-btn');

  if (celsiusBtn && fahrenheitBtn) {
    celsiusBtn.addEventListener('click', () => {
      celsiusBtn.classList.add('bg-white/12', 'text-white');
      celsiusBtn.classList.remove('text-white/35');
      fahrenheitBtn.classList.remove('bg-white/12', 'text-white');
      fahrenheitBtn.classList.add('text-white/35');
      fetchWeather(citySearch?.value.trim() || 'London');
    });
    fahrenheitBtn.addEventListener('click', () => {
      fahrenheitBtn.classList.add('bg-white/12', 'text-white');
      fahrenheitBtn.classList.remove('text-white/35');
      celsiusBtn.classList.remove('bg-white/12', 'text-white');
      celsiusBtn.classList.add('text-white/35');
      fetchWeather(citySearch?.value.trim() || 'London');
    });
  }

  fetchWeather('London');
}

window.addEventListener('DOMContentLoaded', init);
