// Trip Planner
document.getElementById('trip-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const trip = {
        destination: document.getElementById('destination').value,
        start_date: document.getElementById('start-date').value,
        end_date: document.getElementById('end-date').value,
        activities: document.getElementById('activities').value.split(',').map(item => item.trim())
    };

    fetch('/add_trip', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(trip),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();  // Reload the page to show the new trip
        } else {
            alert('Failed to add trip');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

// Weather Forecast
document.getElementById('weather-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const city = document.getElementById('city').value;

    fetch('/get_weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({city: city}),
    })
    .then(response => response.json())
    .then(data => {
        // Display weather data
        const weatherResults = document.getElementById('weather-results');
        weatherResults.innerHTML = `
            <h3>${data.city.name}, ${data.city.country}</h3>
            <ul>
                ${data.list.slice(0, 5).map(item => `
                    <li>
                        <p>Date: ${new Date(item.dt * 1000).toLocaleDateString()}</p>
                        <p>Temperature: ${item.main.temp}°C</p>
                        <p>Description: ${item.weather[0].description}</p>
                    </li>
                `).join('')}
            </ul>
        `;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

// AI Chatbot
document.getElementById('chat-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userInput = document.getElementById('chat-input').value;

    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({input: userInput}),
    })
    .then(response => response.json())
    .then(data => {
        // Display AI response
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML += `
            <div class="message user">${userInput}</div>
            <div class="message ai">${data.response}</div>
        `;
        document.getElementById('chat-input').value = '';
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
