import requests
import json
import sys

activities = [
    {
        "date": "10/29/2024",
        "title": "Arrive at Hanoi Airport",
        "start_time": "3:00 PM",
        "end_time": "4:00 PM",
        "description": "Arrival at Noi Bai International Airport",
        "location": "Noi Bai International Airport",
        "category": "Travel",
        "price": 0,
        "latitude": 21.2187149,
        "longitude": 105.8019822
    },
    {
        "date": "10/30/2024",
        "title": "Visit Hoan Kiem Lake",
        "start_time": "10:00 AM",
        "end_time": "12:00 PM",
        "description": "Explore the iconic Hoan Kiem Lake in Hanoi",
        "location": "Hoan Kiem Lake",
        "category": "Sightseeing",
        "price": 0,
        "latitude": 21.0286,
        "longitude": 105.8524
    },
    {
        "date": "10/31/2024",
        "title": "Ha Long Bay Cruise",
        "start_time": "9:00 AM",
        "end_time": "5:00 PM",
        "description": "Full-day cruise in Ha Long Bay",
        "location": "Ha Long Bay",
        "category": "Sightseeing",
        "price": 150,
        "latitude": 20.9101,
        "longitude": 107.1839
    }
]

url = 'http://0.0.0.0:5000/bulk_add_activities'
headers = {'Content-Type': 'application/json'}
data = {'activities': activities}

try:
    print(f"Sending request to {url}")
    response = requests.post(url, headers=headers, json=data, timeout=10)
    print(f"Response status code: {response.status_code}")
    print(f"Response content: {response.text}")
    response.raise_for_status()
    print("Activities added successfully")
except requests.exceptions.RequestException as e:
    print(f"An error occurred while connecting to the server: {e}", file=sys.stderr)
    print(f"Request details: URL={url}, Headers={headers}, Data={json.dumps(data)}", file=sys.stderr)
except Exception as e:
    print(f"An unexpected error occurred: {e}", file=sys.stderr)
    print(f"Request details: URL={url}, Headers={headers}, Data={json.dumps(data)}", file=sys.stderr)
