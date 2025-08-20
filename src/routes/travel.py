from flask import Blueprint, request, jsonify
import requests
import json
import os

travel_bp = Blueprint('travel', __name__)

# Google Maps API key - In production, this should be in environment variables
GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"

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
        
        # For now, return mock data since we don't have a real API key
        # In production, this would use Google Distance Matrix API
        mock_data = {
            'home_to_work': {
                'distance': '15.2 km',
                'duration': '25 mins',
                'duration_value': 1500  # seconds
            },
            'work_to_home': {
                'distance': '15.2 km', 
                'duration': '30 mins',
                'duration_value': 1800  # seconds
            },
            'home_to_school': {
                'distance': '8.5 km',
                'duration': '15 mins', 
                'duration_value': 900  # seconds
            },
            'school_to_home': {
                'distance': '8.5 km',
                'duration': '18 mins',
                'duration_value': 1080  # seconds
            },
            'work_to_school': {
                'distance': '12.3 km',
                'duration': '20 mins',
                'duration_value': 1200  # seconds
            },
            'school_to_work': {
                'distance': '12.3 km',
                'duration': '22 mins',
                'duration_value': 1320  # seconds
            }
        }
        
        return jsonify({
            'success': True,
            'travel_times': mock_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@travel_bp.route('/calculate-time-loss', methods=['POST'])
def calculate_time_loss():
    """
    Calculate daily, monthly, and yearly time loss based on travel times
    """
    try:
        data = request.get_json()
        travel_times = data.get('travel_times', {})
        
        # Calculate daily time loss (assuming 2 trips per day for each route)
        daily_seconds = 0
        
        # Morning: Home -> Work -> School
        daily_seconds += travel_times.get('home_to_work', {}).get('duration_value', 0)
        daily_seconds += travel_times.get('work_to_school', {}).get('duration_value', 0)
        
        # Evening: School -> Work -> Home  
        daily_seconds += travel_times.get('school_to_work', {}).get('duration_value', 0)
        daily_seconds += travel_times.get('work_to_home', {}).get('duration_value', 0)
        
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

