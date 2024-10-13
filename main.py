import requests
import ctypes
import os
import dotenv

# Check if the request was successful
def main():
    # NASA API endpoint and your API key

    url = "https://api.nasa.gov/planetary/apod"
    # Take your API key from the environment variables
    dotenv.load_dotenv()

    api_key = os.environ.get("API_KEY")
    path = os.path.join(os.getcwd(), "screen")
    # Make the request
    response = requests.get(url, params={"api_key": api_key})
    if response.status_code == 200:
        data = response.json()
        image_url = data.get("url")
        title = data.get("title")
        date = data.get("date")
        if check_url_image(image_url):
            image_path = os.path.join(path, f"{date} {title}.jpg")
            # Check if the image is already downloaded 
            response = requests.get(image_url)
            with open(image_path, "wb") as file:
                file.write(response.content)
            # Set the image as wallpaper
            print(image_path)
            ctypes.windll.user32.SystemParametersInfoW(20, 0, image_path, 0)
        elif check_url_youtube(image_url):
            print("Youtube video")
            image_path = os.path.join(path, f"{date} {title}.jpg")
            # Get the video ID embedded in the URL
            video_id = image_url.split("/")[-1]
            video_id = video_id.split("?")[0]
            print(video_id)
            # Get the video thumbnail
            image_url = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
            response = requests.get(image_url)
            with open(image_path, "wb") as file:
                file.write(response.content)
            # Set the image as wallpaper
            print(image_path)
            ctypes.windll.user32.SystemParametersInfoW(20, 0, image_path, 0)
        # Delete every image in screen folder
        # for file in os.listdir("\screen"):
        #     os.remove(os.path.join("\screen", file))
        # Download the image to the screen folder
        
        return date + " " + title
    else:
        print("Failed to fetch APOD image.")
        return None
    
def check_url_image(url):
    return url.endswith(".jpg") or url.endswith(".png")
def check_url_youtube(url):
    return url.startswith("https://www.youtube.com/embed")
if __name__ == "__main__":
    main()
