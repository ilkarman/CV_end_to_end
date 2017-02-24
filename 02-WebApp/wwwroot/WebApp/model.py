from flask import render_template, request, json
from io import BytesIO
from PIL import Image, ImageOps
from WebApp import app
import requests
import grequests
import base64
import urllib

backend_server = 'http://appresnet.uksouth.cloudapp.azure.com'
cognitive_server = 'https://westus.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Description&language=en'
cogn_key = 'e07127324d3e47f39164dd8daeabd358'

@app.route("/")
def index():
    return render_template('layout.html')

@app.route("/languages", methods=['GET'])
def return_languages():
    # Process on VM backend
    resp = json.dumps(
        requests.get(backend_server + "/languages").json())
    # Return processed
    return resp

@app.route("/uploader_ios", methods=['POST'])
def upload_file_ios():
    classification = json.dumps(requests.post(url=backend_server + "/uploader_ios", files=request.files).json())
    return classification
    
@app.route("/uploader", methods=['POST'])
def upload_file():
    
    # Check valid image and compress
    try:
        img = Image.open(BytesIO(request.files['imagefile'].read())).convert('RGB')
        img = ImageOps.fit(img, (224, 224), Image.ANTIALIAS)
        ret_imgio = BytesIO()
        img.save(ret_imgio, 'PNG')
        files = {'imagefile': ret_imgio.getvalue()}
        imagefile = files['imagefile']
    except:
        error_msg = "Please choose an image file"
        return render_template('layout.html', **locals())
    
    # Vision API header
    headers = {'Ocp-Apim-Subscription-Key': cogn_key,
               'Content-Type': 'application/octet-stream'}    
    
    # Preapre requests
    rs = (grequests.post(url=backend_server + "/uploader_ios", files=files),  # resnet
          grequests.post(url=cognitive_server, headers=headers, data=imagefile))  # vision
          
    # Submit async
    rsp_resnet, rsp_vision_api = grequests.map(rs)
    
    # Deal with classification
    classification = rsp_resnet.json()['English']
    if rsp_vision_api.status_code ==  200:
            description = rsp_vision_api.json()['description']
            cognitive_services_tag = ", ".join(description['tags'][:3])
            cognitive_services_description = description['captions'][0]['text']
            
    # Get picture
    png_output = base64.b64encode(ret_imgio.getvalue())
    processed_file = urllib.pathname2url(png_output)
    return render_template('layout.html', **locals())
