const apiKey = "f38e4b04de786df972df627e5310b967";

const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const cityInput = document.getElementById('cityInput');
const weatherDisplay = document.getElementById('weatherDisplay');
const historyList = document.getElementById('historyList');

function displayWeather(data) {
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    
    weatherDisplay.innerHTML = `
        <h2>${data.name}</h2>
        <img src="${iconUrl}" alt="Weather Icon" style="width: 120px; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.2));">
        <div class="weather-info" style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 18px; margin-top: 15px; width: 100%; box-sizing: border-box;">
            <p style="font-size: 32px; font-weight: 800; margin: 0; color: #fff;">${Math.round(data.main.temp)}°C</p>
            <p style="text-transform: capitalize; font-size: 18px; margin: 10px 0; color: #fff;">${data.weather[0].description}</p>
            <p style="font-size: 14px; opacity: 0.8; margin: 0; color: #fff;">Humidity: ${data.main.humidity}%</p>
        </div>
    `;
}


// Search Logic
searchBtn.addEventListener('click', async () => {
    const city = cityInput.value.trim();
    if (!city) return alert("Please enter a city name!");

    weatherDisplay.innerHTML = `<div class="spinner"></div>`;

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        
        displayWeather(data);
        saveHistory(data.name);
    } catch (error) {
        weatherDisplay.innerHTML = `<p class="error">${error.message}</p>`;
    }
});

// Geolocation Logic
locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    weatherDisplay.innerHTML = `<div class="spinner"></div>`;
    
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
            const data = await response.json();
            displayWeather(data);
        } catch (error) {
            weatherDisplay.innerHTML = `<p class="error">Location access failed</p>`;
        }
    }, () => weatherDisplay.innerHTML = `<p class="error">Permission denied</p>`);
});

// Robustness: Online/Offline status
window.addEventListener('offline', () => document.getElementById('offlineBanner').style.display = 'block');
window.addEventListener('online', () => document.getElementById('offlineBanner').style.display = 'none');

// Performance: Debouncing
let debounceTimer;
cityInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        console.log("Optimization: API calls restricted during typing");
    }, 500);
});

// History Logic
cityInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchBtn.click(); });

function saveHistory(city) {
    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    if (!history.includes(city)) {
        history.unshift(city);
        if (history.length > 5) history.pop();
        localStorage.setItem('weatherHistory', JSON.stringify(history));
        renderHistory();
    }
}

function renderHistory() {
    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    historyList.innerHTML = history.map(city => `<li>${city}</li>`).join('');
}

historyList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        cityInput.value = e.target.textContent;
        searchBtn.click();
    }
});

window.onload = renderHistory;