import sys
import json
import cv2
import numpy as np

def create_reel(image_paths, output_path):
    frame_array = []
    
    for img_path in image_paths:
        img = cv2.imread(img_path[1:])  # Remove leading '/' for correct path
        height, width, layers = img.shape
        size = (width, height)
        frame_array.append(img)

    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), 1, size)
    
    for frame in frame_array:
        out.write(frame)
    
    out.release()
    return output_path

if __name__ == "__main__":
    print("Arguments received by the script:", sys.argv)  # Debugging line
    if len(sys.argv) < 3:
        print("Error: Not enough arguments provided")
        sys.exit(1)

    # Load image paths from arguments
    image_paths = json.loads(sys.argv[1])
    output_path = sys.argv[2]

    create_reel(image_paths, output_path)
