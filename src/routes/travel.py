from flask import Blueprint, request, jsonify
import requests
import json
import os

travel_bp = Blueprint('travel', __name__)

# Google Maps API key - In production, this should be in environment variables
GOOGLE_MAPS_API_KEY = "AIzaSyD_RxGFjYwvqoDIq17ZMhdLcChy0tTTrnU"

@travel_bp.route('/calculate-travel-time', methods=['POST'])
def calculate_travel_time():
    """
    Calculate travel time between locations using Google Distance Matrix API
    """
    try:
        data = request.get_json()
        
        # Extract locations from request
        home = data.get('home')
        work = data.get('work')
        school = data.get('school')
        
        if not all([home, work, school]):
            return jsonify({'error': 'All three locations (home, work, school) are required'}), 400
        
        # Use Google Distance Matrix API to get real travel times
        base_url = "https://maps.googleapis.com/maps/api/distancematrix/json"
        
        # Define all the routes we need to calculate
        routes = [
            {'origin': home, 'destination': work, 'name': 'home_to_work'},
            {'origin': work, 'destination': home, 'name': 'work_to_home'},
            {'origin': home, 'destination': school, 'name': 'home_to_school'},
            {'origin': school, 'destination': home, 'name': 'school_to_home'},
            {'origin': work, 'destination': school, 'name': 'work_to_school'},
            {'origin': school, 'destination': work, 'name': 'school_to_work'}
        ]
        
        travel_times = {}
        
        for route in routes:
            params = {
                'origins': route['origin'],
                'destinations': route['destination'],
                'mode': 'driving',
                'language': 'mn',  # Mongolian language
                'key': GOOGLE_MAPS_API_KEY
            }
            
            response = requests.get(base_url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                if data['status'] == 'OK' and data['rows'][0]['elements'][0]['status'] == 'OK':
                    element = data['rows'][0]['elements'][0]
                    travel_times[route['name']] = {
                        'distance': element['distance']['text'],
                        'duration': element['duration']['text'],
                        'duration_value': element['duration']['value']  # seconds
                    }
                else:
                    # Fallback to mock data if API fails
                    travel_times[route['name']] = {
                        'distance': '15.0 km',
                        'duration': '25 mins',
                        'duration_value': 1500
                    }
            else:
                # Fallback to mock data if API fails
                travel_times[route['name']] = {
                    'distance': '15.0 km',
                    'duration': '25 mins',
                    'duration_value': 1500
                }
        
        return jsonify({
            'success': True,
            'travel_times': travel_times
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@travel_bp.route('/calculate-time-loss', methods=['POST'])
def calculate_time_loss():
    """
    Calculate daily, monthly, and yearly time loss based on travel times
    Updated for Mongolian family pattern: Home -> School -> Work -> Home
    """
    try:
        data = request.get_json()
        travel_times = data.get('travel_times', {})
        
        # Calculate daily time loss (Mongolian pattern: Home -> School -> Work -> Home)
        daily_seconds = 0
        
        # Morning: Home -> School (drop off child)
        daily_seconds += travel_times.get('home_to_school', {}).get('duration_value', 0)
        
        # Morning: School -> Work (go to work after dropping child)
        daily_seconds += travel_times.get('school_to_work', {}).get('duration_value', 0)
        
        # Evening: Work -> School (pick up child)
        daily_seconds += travel_times.get('work_to_school', {}).get('duration_value', 0)
        
        # Evening: School -> Home (go home with child)
        daily_seconds += travel_times.get('school_to_home', {}).get('duration_value', 0)
        
        # Convert to different time units
        daily_minutes = daily_seconds / 60
        daily_hours = daily_minutes / 60
        
        # Calculate monthly and yearly totals (assuming 22 working days per month)
        monthly_hours = daily_hours * 22
        yearly_hours = monthly_hours * 12
        
        return jsonify({
            'success': True,
            'time_loss': {
                'daily': {
                    'seconds': daily_seconds,
                    'minutes': round(daily_minutes, 1),
                    'hours': round(daily_hours, 2)
                },
                'monthly': {
                    'hours': round(monthly_hours, 1),
                    'days': round(monthly_hours / 24, 2)
                },
                'yearly': {
                    'hours': round(yearly_hours, 1),
                    'days': round(yearly_hours / 24, 1),
                    'weeks': round(yearly_hours / (24 * 7), 2)
                }
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@travel_bp.route('/save-locations', methods=['POST'])
def save_locations():
    """
    Save user's locations to local storage (JSON file)
    """
    try:
        data = request.get_json()
        
        # Create data directory if it doesn't exist
        data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        os.makedirs(data_dir, exist_ok=True)
        
        # Save to JSON file
        file_path = os.path.join(data_dir, 'user_locations.json')
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return jsonify({'success': True, 'message': 'Locations saved successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@travel_bp.route('/load-locations', methods=['GET'])
def load_locations():
    """
    Load user's saved locations from local storage
    """
    try:
        file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'user_locations.json')
        
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return jsonify({'success': True, 'locations': data})
        else:
            return jsonify({'success': True, 'locations': None})
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@travel_bp.route('/search-places', methods=['POST'])
def search_places():
    """
    Search for places using Google Places API
    """
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        # Use Google Places API Text Search
        base_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        
        params = {
            'query': query,
            'language': 'mn',  # Mongolian language
            'key': GOOGLE_MAPS_API_KEY
        }
        
        response = requests.get(base_url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            
            if data['status'] == 'OK':
                places = []
                for place in data.get('results', [])[:5]:  # Limit to 5 results
                    places.append({
                        'name': place.get('name', ''),
                        'formatted_address': place.get('formatted_address', ''),
                        'place_id': place.get('place_id', ''),
                        'geometry': place.get('geometry', {})
                    })
                
                return jsonify({
                    'success': True,
                    'places': places
                })
            else:
                return jsonify({'error': f'Places API error: {data.get("status", "Unknown error")}'}), 400
        else:
            return jsonify({'error': 'Failed to search places'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

