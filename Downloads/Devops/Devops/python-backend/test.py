import requests
import dotenv
import os
dotenv.load_dotenv()

url = "https://gate.whapi.cloud/messages/text"

payload = {
    "to": "919481285281",
    "body": "Hello",
}
headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "authorization": "Bearer "+os.getenv("WHAPI_TOKEN")
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)