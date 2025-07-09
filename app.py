from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
# Update your CORS configuration in Flask:
CORS(app, resources={
    r"/subscribe": {"origins": "*"},
    r"/vote": {"origins": "*"},
    r"/votes": {"origins": "*"}
})

DATA_FILE = "data.json"
BREVO_API_KEY = os.environ.get("BREVO_API_KEY")
BREVO_LIST_ID = 5  # or whatever your list number is
EMAIL = "omariabdullah186@gmail.com"


@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

# Load data from file
def load_data():
    if not os.path.exists(DATA_FILE):
        return {"emails": [], "votes": {}, "last_email_sent": None}
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

# Save data to file
def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

# Email templates
def get_welcome_email(email):
    return {
        'subject': '🎉 Welcome to Global Vote!',
        'message': f"""<html>
            <body>
                <h2>Thanks for joining Glory Vote!</h2>
                <p>Your account is now active and you can start voting for your favorite countries.</p>
                <p><a href="http://yourwebsite.com/vote" style="background: #4fc3f7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Voting Now</a></p>
                <p>Cheers,<br>The Global Vote Team</p>
            </body>
        </html>""",
        'is_html': True
    }

def get_vote_confirmation(email, country):
    return {
        'subject': f'✅ Your vote for {country} has been counted!',
        'message': f"""Hello Voter!
        
Thank you for participating in Global Vote. Your vote for {country} has been successfully recorded.

View live results: http://yourwebsite.com/results

You can only vote once, but you can share with friends to support your favorite country!

Cheers,
Global Vote Team""",
        'is_html': False
    }

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/subscribe', methods=['POST'])
def subscribe():
    try:
        data = load_data()
        email = request.get_json().get('email', '').strip().lower()

        if not email or '@' not in email:
            return jsonify({'status': 'error', 'message': 'Invalid email address'}), 400

        if email in data["emails"]:
            return jsonify({'status': 'success', 'message': 'Already subscribed'})

        # ✅ Add to Brevo first
        brevo_response = add_to_brevo(email)
        if brevo_response.status_code not in [200, 201, 204]:
            try:
                brevo_error = brevo_response.json().get('message', brevo_response.text)
            except Exception:
                brevo_error = brevo_response.text
            
            print(f"⚠️ Brevo error: {brevo_error}")
            return jsonify({
                'status': 'error',
                'message': f'Failed to add to mailing list: {brevo_error}'
            }), 500

        # Only add to local storage if Brevo succeeds
        data["emails"].append(email)
        save_data(data)

        # ✅ Send welcome emavil
        welcome = get_welcome_email(email)
        send_brevo_email( 
    welcome['subject'],
    welcome['message'],
    email
)

        return jsonify({
            'status': 'success',
            'message': 'Subscription successful. Check your email!'
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Subscription failed: {str(e)}'
        }), 500


@app.route('/vote', methods=['POST'])
def vote():
    try:
        data = load_data()
        email = request.get_json().get('email', '').strip().lower()
        country = request.get_json().get('country', '').strip()
        
        if not email or '@' not in email:
            return jsonify({'status': 'error', 'message': 'Invalid email'}), 400
            
        if not country:
            return jsonify({'status': 'error', 'message': 'Country required'}), 400
            
        if email not in data["emails"]:
            return jsonify({'status': 'error', 'message': 'Please subscribe first'}), 400
            
        # Update vote count
        data["votes"][country] = data["votes"].get(country, 0) + 1
        save_data(data)
        
        # Send vote confirmation
        confirmation = get_vote_confirmation(email, country)
        send_brevo_email(
    confirmation['subject'],
    confirmation['message'],
    email
)
        
        return jsonify({
            'status': 'success',
            'votes': data["votes"],
            'message': f'Vote for {country} recorded'
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Voting failed: {str(e)}'
        }), 500

@app.route('/votes', methods=['GET'])
def get_votes():
    data = load_data()
    return jsonify({
        'status': 'success',
        'votes': data["votes"],
        'total_votes': sum(data["votes"].values()),
        'unique_voters': len(data["emails"])
    })

@app.route('/send-newsletter', methods=['POST'])
def send_newsletter():
    try:
        data = load_data()
        subject = request.json.get('subject', '').strip()
        content = request.json.get('content', '').strip()
        
        if not subject or not content:
            return jsonify({'status': 'error', 'message': 'Subject and content required'}), 400
            
        if not data["emails"]:
            return jsonify({'status': 'error', 'message': 'No subscribers yet'}), 400
            
        # Record newsletter time
        data["last_email_sent"] = datetime.now().isoformat()
        save_data(data)
        
        # Send to all subscribers
        for email in data["emails"]:
            send_brevo_email(subject, content, email)
            
        return jsonify({
            'status': 'success',
            'message': f'Newsletter sent to {len(data["emails"])} subscribers',
            'last_sent': data["last_email_sent"]
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Newsletter failed: {str(e)}'
        }), 500

@app.route('/unsubscribe', methods=['GET', 'POST'])
def unsubscribe():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()

        # ✅ Remove from local data
        data = load_data()
        if email in data["emails"]:
            data["emails"].remove(email)
            save_data(data)

        # ✅ Remove from Brevo
        remove_from_brevo(email)

        return render_template('unsubscribed.html', email=email)

    return render_template('unsubscribe.html')


def add_to_brevo(email):
    import requests
    
    url = "https://api.brevo.com/v3/contacts"
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    payload = {
        "email": email,
        "listIds": [BREVO_LIST_ID],
        "updateEnabled": True
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        
        # Check for successful responses (200, 201, 204 are typically success codes)
        if response.status_code in [200, 201, 204]:
            return response
        
        # Try to get detailed error message
        try:
            error_data = response.json()
            error_msg = error_data.get('message', error_data.get('error', str(response.text)))
        except:
            error_msg = response.text
            
        print(f"Brevo API Error {response.status_code}: {error_msg}")
        return response

    except Exception as e:
        print(f"Brevo connection error: {str(e)}")
        raise

def send_brevo_email(subject, html_content, to_email):
    import requests
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }
    payload = {
        "sender": {"name": "Global Vote", "email": EMAIL},
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_content
    }
    response = requests.post(url, json=payload, headers=headers)
    return response

@app.route('/debug/brevo-lists')
def debug_brevo_lists():
    import requests
    url = "https://api.brevo.com/v3/contacts/lists"
    headers = {
        "accept": "application/json",
    }
    response = requests.get(url, headers=headers)
    return response.json()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
