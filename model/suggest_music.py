from flask import Flask, request, jsonify, send_from_directory
import random
import os

app = Flask(__name__)

# Path to the music directory
MUSIC_FOLDER = os.path.join(os.getcwd(), 'model/music')

# A basic dictionary mapping sentiment to music suggestions
sentiment_to_music = {
    'happy': ['happy.mp3'],
    'sad': ['sad.mp3'],
    'angry': ['angry.mp3'],
    'neutral': ['neutral.mp3']
}

@app.route('/api/suggest-music', methods=['POST'])
def suggest_music():
    data = request.get_json()
    sentiment = data.get('sentiment')

    # Debugging the received sentiment
    print(f"Received sentiment: {sentiment}")

    # Suggest a random music track based on sentiment
    if sentiment in sentiment_to_music:
        suggested_track = random.choice(sentiment_to_music[sentiment])
        # Debugging the selected track
        print(f"Suggested track: {suggested_track}")
        return jsonify({"musicTrack": suggested_track})
    else:
        return jsonify({"error": "Invalid sentiment"}), 400

   

@app.route('/music/<filename>')
def get_music(filename):
    # Serve music files from the 'music' folder
    return send_from_directory(MUSIC_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True)
