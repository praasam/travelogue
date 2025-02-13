import sys
from moviepy.editor import ImageSequenceClip, AudioFileClip

def create_reel(image_paths, audio_path, output_path="output.mp4"):
    try:
        clip = ImageSequenceClip(image_paths, fps=1)  # Adjust fps as needed
        audio = AudioFileClip(audio_path)
        clip = clip.set_audio(audio)
        clip.write_videofile(output_path, codec="libx264", fps=24)
        print(output_path)
    except Exception as e:
        print("Error:", str(e))

if __name__ == "__main__":
    images = sys.argv[1:-1]  # List of image paths
    audio = sys.argv[-1]  # Audio path
    create_reel(images, audio)
