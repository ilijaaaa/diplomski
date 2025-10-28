#!/usr/bin/env python
import urllib.request
import json
import jwt

# Login first to get token
login_data = {
    "username": "marko_org",
    "password": "password123"
}

print("=== Getting fresh token ===")
login_json = json.dumps(login_data).encode('utf-8')
login_req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login/', 
                                   data=login_json,
                                   headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(login_req) as response:
        login_response = json.loads(response.read().decode('utf-8'))
        access_token = login_response['tokens']['access']
        
        print(f"Token: {access_token[:50]}...")
        
        # Decode token without verification to see contents
        decoded = jwt.decode(access_token, options={"verify_signature": False})
        print("Decoded token:")
        print(json.dumps(decoded, indent=2))
        
        # Check what user_id is in token
        user_id = decoded.get('user_id')
        print(f"\nToken user_id: {user_id}")
        
except Exception as e:
    print(f"Error: {e}")