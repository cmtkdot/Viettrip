import requests
import json

activities = [
    {
        "date": "10/29/2024",
        "title": "Arrive at Hanoi Airport",
        "start_time": "3:00 PM",
        "end_time": "4:00 PM",
        "description": "",
        "location": "Noibai International Airport (HAN)",
        "category": "Travel",
        "price": 0
    },
    {
        "date": "10/29/2024",
        "title": "Check in Hotel",
        "start_time": "4:00 PM",
        "end_time": "5:00 PM",
        "description": "",
        "location": "",
        "category": "Accommodation",
        "price": 0
    },
    {
        "date": "10/29/2024",
        "title": "Old Quarters",
        "start_time": "5:00 PM",
        "end_time": "7:00 PM",
        "description": "Hanoi's Old Quarter, where each street is named after the goods historically sold there (like Silk Street or Silver Street). The area is packed with street vendors, small shops, ancient houses, and pagodas.",
        "location": "Hoàn Kiếm District",
        "category": "Sightseeing",
        "price": 0
    },
    {
        "date": "10/29/2024",
        "title": "Hoan Kiem Lake",
        "start_time": "7:00 PM",
        "end_time": "8:00 PM",
        "description": "Might be better night time cause looks nice",
        "location": "Hoàn Kiếm Lake",
        "category": "Sightseeing",
        "price": 0
    },
    {
        "date": "10/29/2024",
        "title": "Ngoc Son Temple",
        "start_time": "8:00 PM",
        "end_time": "9:00 PM",
        "description": "Located on an island in Hoan Kiem Lake.",
        "location": "Ngoc Son Temple",
        "category": "Cultural",
        "price": 0
    },
    {
        "date": "10/29/2024",
        "title": "Dong Xuan Market",
        "start_time": "9:00 PM",
        "end_time": "10:00 PM",
        "description": "Street Food - 15-minute walk from Hoan Kiem Lake.",
        "location": "Đồng Xuân Market",
        "category": "Food",
        "price": 0
    },
    {
        "date": "10/29/2024",
        "title": "Thang Long Water Puppet Theatre - water puppet show",
        "start_time": "10:00 PM",
        "end_time": "11:00 PM",
        "description": "Hoan Kiem Lake: Right across the street from the theatre.",
        "location": "",
        "category": "Entertainment",
        "price": 0
    },
    {
        "date": "10/29/2024",
        "title": "Ho Chi Minh Mausoleum Complex",
        "start_time": "11:00 AM",
        "end_time": "1:00 PM",
        "description": "One Pillar Pagoda: Located within the complex. Presidential Palace: Located within the complex. Temple of Literature: ~1.5 km (5-minute drive).",
        "location": "2 Hùng Vương",
        "category": "Historical",
        "price": 0
    },
    {
        "date": "10/29/2024",
        "title": "Temple of Literature",
        "start_time": "1:00 PM",
        "end_time": "2:00 PM",
        "description": "",
        "location": "58 Phố Quốc Tử Giám",
        "category": "Cultural",
        "price": 0
    }
]

url = 'http://localhost:5000/bulk_add_activities'
headers = {'Content-Type': 'application/json'}
data = {'activities': activities}

response = requests.post(url, headers=headers, data=json.dumps(data))
print(response.status_code)
print(response.json())
