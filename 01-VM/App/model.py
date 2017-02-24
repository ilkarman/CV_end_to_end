from flask import Flask, render_template, request, json
from io import BytesIO
from PIL import Image, ImageOps
import mxnet as mx
import numpy as np
import os
from collections import namedtuple
import sys

Batch = namedtuple('Batch', ['data'])
app = Flask(__name__)

# Labels
# Obviously redo this method ...
with open('synset.txt', 'r') as f:
    synsets = [l.rstrip() for l in f]
with open('synset_es.txt', 'r') as f:
    synset_es = [l.rstrip() for l in f]
with open('synset_tr.txt', 'r') as f:
    synset_tr = [l.rstrip() for l in f]
with open('synset_ru.txt', 'r') as f:
    synset_ru = [l.rstrip() for l in f]
with open('synset_it.txt', 'r') as f:
    synset_it = [l.rstrip() for l in f]

available_languages = {"languages": [
			{'name': 'None', 	'icon': ''},
			{'name': 'Italian', 		'icon': 'it.png'},
			{'name': 'Russian', 		'icon': 'ru.png'},
            {'name': 'Spanish', 		'icon': 'es.png'},
            {'name': 'Turkish', 		'icon': 'tr.png'}
            ]}

# Load model
model = mx.model.FeedForward.load('resnet-152', 0, ctx=mx.cpu())

@app.route("/")
def index():
    print(sys.version)
    return render_template('layout.html')

@app.route("/languages", methods=['GET'])
def return_languages():
    return json.dumps(available_languages)

@app.route("/uploader_ios", methods=['POST'])
def upload_file_ios():
    # Get image from upload and stream into PIL object
    imagefile = request.files['imagefile']
    img = Image.open(BytesIO(imagefile.read())).convert('RGB')

      # Run some processing and get back image and data
    _, ret_dta_en, ret_dta_es, ret_dta_tr, ret_dta_ru, ret_dta_it = run_some_function_using_image_as_input(img)
    
    classification = {
    		'None': '',
            'English': ret_dta_en,
            'Spanish': ret_dta_es,
            'Italian': ret_dta_it,
            'Turkish': ret_dta_tr,
            'Russian': ret_dta_ru
    }
    classification_out = json.dumps(classification)
    return classification_out


def run_some_function_using_image_as_input(img):

  	# Load image
    img = ImageOps.fit(img, (224, 224), Image.ANTIALIAS)

    # Change shape
    img_np = np.swapaxes(img, 0, 2)
    img_np = np.swapaxes(img_np, 1, 2)
    img_np = img_np[np.newaxis, :]

    # Prediction
    res = model.predict(mx.nd.array(img_np), mx.cpu())
    prob = np.squeeze(res)

    # Category
    a = np.argsort(prob)[-1]
    classification = " ".join(synsets[a].split(" ")[1:]).split(",")[0]
    
    return img, classification, synset_es[a], synset_tr[a], synset_ru[a], synset_it[a]

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5005)