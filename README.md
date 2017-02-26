# K-Voice
> Streaming Service for voice recognition and translation based on [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API), [Google Cloud Platform](https://cloud.google.com/) services

* [Demo Page](https://kvoice.howdilab.com)

This service provides the following functionality:
* Voice recognition based on [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) and [Google Cloud Speech API (Alpha)](https://github.com/GoogleCloudPlatform/google-cloud-node#google-cloud-speech-alpha)
* Translation between Korean and English based on [Google Cloud Translation API (Alpha)](https://github.com/GoogleCloudPlatform/google-cloud-node#google-cloud-translation-api-alpha)
* Voice streaming visualization based on [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

Client-side component works with the following browsers:
* Chrome 15+


# Workflow

Server-side
```sh
$ git clone https://github.com/yeoshim/k-voice.git
$ cd k-voice/server
$ npm install
$ node streamServer.js
```

Client-side
```sh
$ cd k-voice/www
$ python -m SimpleHTTPServer
```
Then visit `http://localhost:8000` on your browser.


## Python SimpleHTTPServer

If you need a quick web server running and you don't want to mess with setting up apache or something similar, then Python can help. Python comes with a simple builtin HTTP server. With the help of this little HTTP server you can turn any directory in your system into your web server directory. The only thing you need to have installed is [Python](https://www.python.org/downloads/) (Python is already installed if you are using Mac OS X).

[Python SimpleHTTPServer tutorial](https://github.com/lmccart/itp-creative-js/wiki/SimpleHTTPServer)

Type in Terminal:
```
python -m SimpleHTTPServer
```

Or if you are using Python 3, type:
```
python -m http.server
```

Then visit `http://localhost:8000` on your browser.


# Requirments
Server
* [binaryjs](https://github.com/binaryjs/binaryjs)
* [node-wav](https://github.com/TooTallNate/node-wav)
* [Google Cloud Speech API (Alpha)](https://github.com/GoogleCloudPlatform/google-cloud-node#google-cloud-speech-alpha)
* [Google Cloud Translation API (Alpha)](https://github.com/GoogleCloudPlatform/google-cloud-node#google-cloud-translation-api-alpha)

Client
* [Ionic](https://github.com/driftyco/ionic)
* [Ionic-Material](https://github.com/zachfitz/Ionic-Material)
* [binaryjs](https://github.com/binaryjs/binaryjs)


# Going Further

* initial calibration for various environments
* hybrid app with [Ionic](https://github.com/driftyco/ionic), [ng-cordova](https://github.com/driftyco/ng-cordova)
* refactoring for robust error handling
* anymore that you can think of goes here ...
