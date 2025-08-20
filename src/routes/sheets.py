from flask import Blueprint, request, jsonify, session, redirect, url_for
import os
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import datetime

sheets_bp = Blueprint('sheets', __name__)

# OAuth 2.0 configuration
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
CLIENT_SECRETS_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'client_secret.json')

def get_google_auth_flow():
    """Create and return Google OAuth flow"""
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES
    )
    # Set redirect URI for web application
    flow.redirect_uri = request.url_root + 'api/oauth2callback'
    return flow

@sheets_bp.route('/auth-google', methods=['GET'])
def auth_google():
    """Initiate Google OAuth 2.0 authorization"""
    try:
        flow = get_google_auth_flow()
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        
        # Store state in session for security
        session['state'] = state
        
        return jsonify({
            'success': True,
            'authorization_url': authorization_url
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sheets_bp.route('/oauth2callback')
def oauth2callback():
    """Handle OAuth 2.0 callback"""
    try:
        # Verify state parameter
        state = session.get('state')
        if not state or state != request.args.get('state'):
            return jsonify({'error': 'Invalid state parameter'}), 400
        
        flow = get_google_auth_flow()
        flow.fetch_token(authorization_response=request.url)
        
        # Store credentials in session
        credentials = flow.credentials
        session['credentials'] = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
        
        # Redirect back to main app with success message
        return redirect('/?auth=success')
        
    except Exception as e:
        return redirect(f'/?auth=error&message={str(e)}')

@sheets_bp.route('/check-auth', methods=['GET'])
def check_auth():
    """Check if user is authenticated with Google"""
    try:
        if 'credentials' not in session:
            return jsonify({'authenticated': False})
        
        # Try to refresh credentials if needed
        credentials = Credentials(**session['credentials'])
        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            # Update session with new credentials
            session['credentials'] = {
                'token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_uri': credentials.token_uri,
                'client_id': credentials.client_id,
                'client_secret': credentials.client_secret,
                'scopes': credentials.scopes
            }
        
        return jsonify({'authenticated': True})
        
    except Exception as e:
        return jsonify({'authenticated': False, 'error': str(e)})

@sheets_bp.route('/create-spreadsheet', methods=['POST'])
def create_spreadsheet():
    """Create a new Google Spreadsheet for travel time data"""
    try:
        if 'credentials' not in session:
            return jsonify({'error': 'Not authenticated. Please authenticate with Google first.'}), 401
        
        credentials = Credentials(**session['credentials'])
        service = build('sheets', 'v4', credentials=credentials)
        
        # Create new spreadsheet
        spreadsheet = {
            'properties': {
                'title': 'Зорчих цагийн тооцоолол - Travel Time Calculator'
            },
            'sheets': [{
                'properties': {
                    'title': 'Тооцооллын түүх'
                }
            }]
        }
        
        result = service.spreadsheets().create(body=spreadsheet).execute()
        spreadsheet_id = result.get('spreadsheetId')
        
        # Set up headers
        headers = [
            'Огноо', 'Цаг', 'Гэрийн хаяг', 'Сургуулийн хаяг', 'Ажлын хаяг',
            'Гэр → Сургууль (мин)', 'Сургууль → Ажил (мин)', 
            'Ажил → Сургууль (мин)', 'Сургууль → Гэр (мин)',
            'Өдрийн нийт цаг', 'Сарын нийт цаг', 'Жилийн нийт өдөр'
        ]
        
        # Add headers to spreadsheet
        values = [headers]
        body = {'values': values}
        
        service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range='A1:L1',
            valueInputOption='RAW',
            body=body
        ).execute()
        
        # Format headers (make them bold)
        requests = [{
            'repeatCell': {
                'range': {
                    'sheetId': 0,
                    'startRowIndex': 0,
                    'endRowIndex': 1
                },
                'cell': {
                    'userEnteredFormat': {
                        'textFormat': {
                            'bold': True
                        }
                    }
                },
                'fields': 'userEnteredFormat.textFormat.bold'
            }
        }]
        
        service.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body={'requests': requests}
        ).execute()
        
        # Store spreadsheet ID in session
        session['spreadsheet_id'] = spreadsheet_id
        
        return jsonify({
            'success': True,
            'spreadsheet_id': spreadsheet_id,
            'spreadsheet_url': f'https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit'
        })
        
    except HttpError as error:
        return jsonify({'error': f'Google Sheets API error: {error}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sheets_bp.route('/save-to-sheets', methods=['POST'])
def save_to_sheets():
    """Save travel time calculation results to Google Sheets"""
    try:
        if 'credentials' not in session:
            return jsonify({'error': 'Not authenticated. Please authenticate with Google first.'}), 401
        
        data = request.get_json()
        locations = data.get('locations', {})
        travel_times = data.get('travel_times', {})
        time_loss = data.get('time_loss', {})
        
        credentials = Credentials(**session['credentials'])
        service = build('sheets', 'v4', credentials=credentials)
        
        # Get or create spreadsheet
        spreadsheet_id = session.get('spreadsheet_id')
        if not spreadsheet_id:
            # Create new spreadsheet if none exists
            create_result = create_spreadsheet()
            if not create_result[1] == 200:  # Check if creation failed
                return create_result
            spreadsheet_id = session.get('spreadsheet_id')
        
        # Prepare data row
        now = datetime.datetime.now()
        row_data = [
            now.strftime('%Y-%m-%d'),  # Date
            now.strftime('%H:%M:%S'),  # Time
            locations.get('home', ''),  # Home address
            locations.get('school', ''),  # School address
            locations.get('work', ''),  # Work address
            travel_times.get('home_to_school', {}).get('duration', ''),  # Home to School
            travel_times.get('school_to_work', {}).get('duration', ''),  # School to Work
            travel_times.get('work_to_school', {}).get('duration', ''),  # Work to School
            travel_times.get('school_to_home', {}).get('duration', ''),  # School to Home
            f"{time_loss.get('daily', {}).get('hours', 0)} цаг",  # Daily total
            f"{time_loss.get('monthly', {}).get('hours', 0)} цаг",  # Monthly total
            f"{time_loss.get('yearly', {}).get('days', 0)} өдөр"  # Yearly total
        ]
        
        # Append data to spreadsheet
        values = [row_data]
        body = {'values': values}
        
        result = service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range='A:L',
            valueInputOption='RAW',
            insertDataOption='INSERT_ROWS',
            body=body
        ).execute()
        
        return jsonify({
            'success': True,
            'message': 'Өгөгдөл Google Sheets-д амжилттай хадгалагдлаа!',
            'spreadsheet_url': f'https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit',
            'updated_cells': result.get('updates', {}).get('updatedCells', 0)
        })
        
    except HttpError as error:
        return jsonify({'error': f'Google Sheets API error: {error}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sheets_bp.route('/get-spreadsheet-url', methods=['GET'])
def get_spreadsheet_url():
    """Get the URL of the current spreadsheet"""
    try:
        spreadsheet_id = session.get('spreadsheet_id')
        if not spreadsheet_id:
            return jsonify({'error': 'No spreadsheet found. Please create one first.'}), 404
        
        return jsonify({
            'success': True,
            'spreadsheet_url': f'https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sheets_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user and clear session"""
    try:
        session.clear()
        return jsonify({'success': True, 'message': 'Successfully logged out'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

