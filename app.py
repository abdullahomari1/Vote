from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
from pymongo import MongoClient, errors
import os
from datetime import datetime
import certifi
import urllib.parse

app = Flask(__name__)
# Update your CORS configuration in Flask:
CORS(app, resources={
    r"/subscribe": {"origins": "*"},
    r"/vote": {"origins": "*"},
    r"/votes": {"origins": "*"}
})


BREVO_API_KEY = os.environ.get("BREVO_API_KEY")
BREVO_LIST_ID = 5  # or whatever your list number is
EMAIL = "omariabdullah186@gmail.com"

# --------------------------
# MongoDB (SRV) configuration
# --------------------------
# Prefer a complete MONGO_URI; otherwise build from provided password.
MONGO_URI = os.environ.get("MONGO_URI")
if not MONGO_URI:
    # If user provided only a password, build the SRV URI using the
    # host provided by you:
    mongo_pwd = os.environ.get("MONGO_PASSWORD")
    mongo_user = os.environ.get("MONGO_USER", "Global_Vote")
    mongo_host = os.environ.get("MONGO_HOST", "globalvote.41ms7al.mongodb.net")
    mongo_options = os.environ.get("MONGO_OPTIONS", "?appName=GlobalVote")
    if not mongo_pwd:
        raise RuntimeError(
            "MONGO_URI or MONGO_PASSWORD must be set in the environment. "
            "Set MONGO_URI to the full connection string or set MONGO_PASSWORD "
            "so the app can construct the mongodb+srv URI."
        )
    # URL-encode the password in case it contains special characters
    safe_pwd = urllib.parse.quote_plus(mongo_pwd)
    MONGO_URI = f"mongodb+srv://{mongo_user}:{safe_pwd}@{mongo_host}/{mongo_options}"

# Optional DB name env var
MONGO_DBNAME = os.environ.get("MONGO_DBNAME", "Global_Vote")

# Create client with a short server selection timeout so startup fails fast
try:
    client = MongoClient(
        MONGO_URI,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=5000
    )
    # Verify connection (will raise ServerSelectionTimeoutError on failure)
    client.admin.command("ping")
except errors.ServerSelectionTimeoutError as e:
    # This will cause the process to exit if not handled by the runtime environment;
    # it's intentional so you can see the failure in logs and fix the connection.
    print("ERROR: Could not connect to MongoDB (ServerSelectionTimeout):", e)
    raise
except Exception as e:
    print("ERROR: MongoDB connection failed:", e)
    raise

db = client[MONGO_DBNAME]
emails_col = db["emails"]
votes_col = db["votes"]


@app.route('/privacy')
def privacy():
    return render_template('privacy.html')


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
        if not BREVO_API_KEY:
            return jsonify({'status': 'error', 'message': 'Server email configuration error. Please contact support.'}), 500

        email = request.get_json().get('email', '').strip().lower()

        if not email or '@' not in email:
            return jsonify({'status': 'error', 'message': 'Invalid email address'}), 400

        # Check if already subscribed in MongoDB
        if emails_col.find_one({"email": email}):
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

        # Add to MongoDB
        emails_col.insert_one({"email": email, "subscribed_at": datetime.utcnow()})

        # ✅ Send welcome email
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
        print(f"Subscribe error: {str(e)}")  # Log error for debugging
        return jsonify({
            'status': 'error',
            'message': f'Subscription failed: {str(e)}'
        }), 500


@app.route('/vote', methods=['POST'])
def vote():
    try:
        email = request.get_json().get('email', '').strip().lower()
        country = request.get_json().get('country', '').strip()
        
        if not email or '@' not in email:
            return jsonify({'status': 'error', 'message': 'Invalid email'}), 400
            
        if not country:
            return jsonify({'status': 'error', 'message': 'Country required'}), 400
            
        if not emails_col.find_one({"email": email}):
            return jsonify({'status': 'error', 'message': 'Please subscribe first'}), 400
            
        # Update vote count in MongoDB
        votes_col.update_one({"country": country}, {"$inc": {"count": 1}}, upsert=True)
        
        # Send vote confirmation
        confirmation = get_vote_confirmation(email, country)
        send_brevo_email(
            confirmation['subject'],
            confirmation['message'],
            email
        )
        
        votes = {v["country"]: v["count"] for v in votes_col.find()}
        return jsonify({
            'status': 'success',
            'votes': votes,
            'message': f'Vote for {country} recorded'
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Voting failed: {str(e)}'
        }), 500


@app.route('/votes', methods=['GET'])
def get_votes():
    votes = {v["country"]: v["count"] for v in votes_col.find()}
    total_votes = sum(votes.values())
    unique_voters = emails_col.count_documents({})
    return jsonify({
        'status': 'success',
        'votes': votes,
        'total_votes': total_votes,
        'unique_voters': unique_voters
    })


@app.route('/send-newsletter', methods=['POST'])
def send_newsletter():
    try:
        subject = request.json.get('subject', '').strip()
        content = request.json.get('content', '').strip()
        
        if not subject or not content:
            return jsonify({'status': 'error', 'message': 'Subject and content required'}), 400
            
        emails = [doc['email'] for doc in emails_col.find()]
        if not emails:
            return jsonify({'status': 'error', 'message': 'No subscribers yet'}), 400
            
        last_email_sent = datetime.now().isoformat()
        
        # Send to all subscribers
        for email in emails:
            send_brevo_email(subject, content, email)
            
        return jsonify({
            'status': 'success',
            'message': f'Newsletter sent to {len(emails)} subscribers',
            'last_sent': last_email_sent
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

        # Remove from MongoDB
        emails_col.delete_one({"email": email})

        # Remove from Brevo
        try:
            remove_from_brevo(email)
        except NameError:
            # If remove_from_brevo isn't defined (wasn't in original code),
            # just log and continue.
            print("remove_from_brevo not defined; skipped Brevo removal")

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
