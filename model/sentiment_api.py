# import cv2
# import numpy as np
# import os
# from tensorflow.keras.preprocessing import image
# import tensorflow as tf
# from moviepy.video.io.VideoFileClip import VideoFileClip

# # Load pre-trained sentiment analysis model
# model = tf.keras.models.load_model('sentiment_model.h5')

# # Music mapping based on sentiment
# sentiment_music_map = {
#     'Happiness': 'upbeat_music.mp3',
#     'Sadness': 'melancholic_music.mp3',
#     'Anger': 'intense_music.mp3',
#     'Fear': 'suspenseful_music.mp3',
#     'Surprise': 'dramatic_music.mp3',
#     'Disgust': 'unsettling_music.mp3'
# }

# def predict_sentiment(img_path):
#     """Predict sentiment from an image."""
#     img = image.load_img(img_path, target_size=(48, 48))  # Assuming the model needs 48x48 input
#     img_array = image.img_to_array(img) / 255.0  # Normalize the image
#     img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
#     predictions = model.predict(img_array)
#     sentiment = np.argmax(predictions)  # Get the index of the highest probability
#     sentiments = ['Anger', 'Disgust', 'Fear', 'Happiness', 'Sadness', 'Surprise']
#     return sentiments[sentiment]

# def get_music_for_sentiment(sentiment):
#     """Map sentiment to music."""
#     return sentiment_music_map.get(sentiment, 'default_music.mp3')

# # Video generation and sentiment analysis
# img_folder = "./images"  # Path to your images folder
# output_video = 'dynamic_output_video.mp4'

# # Initialize video writer
# images = [img for img in os.listdir(img_folder) if img.endswith(".jpg")]
# images.sort()  # Sort images to maintain the correct order
# frame = cv2.imread(os.path.join(img_folder, images[0]))  # Read the first image to get frame size
# height, width, layers = frame.shape
# fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec for .mp4 video
# video = cv2.VideoWriter(output_video, fourcc, 1, (width, height))  # 1 FPS for simplicity

# # Track the current sentiment and music
# current_music = None
# music_clip = None

# # Loop through the images and dynamically process each one
# for image_file in images:
#     img_path = os.path.join(img_folder, image_file)
#     sentiment = predict_sentiment(img_path)  # Get sentiment for the image
#     print(f"Sentiment for {image_file}: {sentiment}")

#     # Select music based on sentiment
#     music_track = get_music_for_sentiment(sentiment)

#     # If the sentiment or music changes, update the music
#     if music_track != current_music:
#         current_music = music_track
#         if music_clip:
#             music_clip.close()  # Close the previous music clip

#         # Load the new music
#         music_clip = AudioFileClip(music_track)

#     # Add image to video
#     img = cv2.imread(img_path)
#     video.write(img)

# # Release the video writer after processing all images
# video.release()

# # Now, add the dynamic music to the video
# video_clip = VideoFileClip(output_video)
# video_clip = video_clip.set_audio(music_clip)

# # Write the final video with dynamic music
# video_clip.write_videofile("final_dynamic_reel.mp4", codec='libx264')

# print("Video creation complete.")



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