from flask import Flask, request, jsonify
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Initialize the Flask app and sentiment analyzer
app = Flask(__name__)
nltk.download('vader_lexicon')
sia = SentimentIntensityAnalyzer()

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    text = request.json.get('text', '')
    if text:
        sentiment = sia.polarity_scores(text)
        return jsonify(sentiment)
    return jsonify({'error': 'No text provided'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Run the Flask app on port 5000
