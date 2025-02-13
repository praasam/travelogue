import nltk
import sys
import json
from nltk.sentiment import SentimentIntensityAnalyzer

# Download required data (run this once)
nltk.download("vader_lexicon")

# Initialize Sentiment Analyzer
sia = SentimentIntensityAnalyzer()

def analyze_sentiment(text):
    score = sia.polarity_scores(text)
    return {"text": text, "sentiment": score["compound"]}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
        result = analyze_sentiment(input_text)
        print(json.dumps(result))  # Convert to JSON string for Node.js
