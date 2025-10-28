#!/usr/bin/env python
import urllib.request
import urllib.parse
import json
import sys

# Login first
login_data = {
    "username": "marko_org",
    "password": "password123"
}

print("=== Testing Login ===")
login_json = json.dumps(login_data).encode('utf-8')
login_req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login/', 
                                   data=login_json,
                                   headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(login_req) as response:
        login_response = json.loads(response.read().decode('utf-8'))
        print("✓ Login successful!")
        
        # Get access token
        access_token = login_response['tokens']['access']
        print(f"Access token: {access_token[:50]}...")
        
        # Test me endpoint
        print("\n=== Testing ME endpoint ===")
        me_req = urllib.request.Request('http://127.0.0.1:8000/api/auth/me/', 
                                       headers={
                                           'Authorization': f'Bearer {access_token}',
                                           'Content-Type': 'application/json'
                                       })
        
        try:
            with urllib.request.urlopen(me_req) as me_response:
                me_result = json.loads(me_response.read().decode('utf-8'))
                print("✓ ME endpoint successful!")
                print(f"User data: {me_result}")
        except urllib.error.HTTPError as e:
            print(f"✗ ME endpoint failed: {e.code}")
            print(f"Response: {e.read().decode('utf-8')}")
        
        # Test update_profil endpoint
        print("\n=== Testing UPDATE_PROFIL endpoint ===")
        update_data = {
            "imek": "Marko UPDATED",
            "przk": "Petrovic UPDATED"
        }
        
        update_json = json.dumps(update_data).encode('utf-8')
        update_req = urllib.request.Request('http://127.0.0.1:8000/api/auth/update_profil/', 
                                           data=update_json,
                                           headers={
                                               'Authorization': f'Bearer {access_token}',
                                               'Content-Type': 'application/json'
                                           },
                                           method='PUT')
        
        try:
            with urllib.request.urlopen(update_req) as update_response:
                update_result = json.loads(update_response.read().decode('utf-8'))
                print("✓ UPDATE_PROFIL endpoint successful!")
                print(f"Update response: {update_result}")
        except urllib.error.HTTPError as e:
            print(f"✗ UPDATE_PROFIL endpoint failed: {e.code}")
            print(f"Response: {e.read().decode('utf-8')}")
            
except urllib.error.HTTPError as e:
    print(f"✗ Login failed: {e.code}")
    print(f"Response: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"✗ Error: {e}")