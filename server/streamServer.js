/**
 * Created by yeoshim on 2017. 2. 25..
 */
'use strict';

const fs = require('fs');
const wav = require('wav');

const WAITING_TIME = 300;

// Your Google Cloud Platform project ID
const projectId = 'kvoice-159503';

const Speech = require('@google-cloud/speech');
const speech = Speech({
  projectId: projectId
});

const Translate = require('@google-cloud/translate');

const binaryServer = require('binaryjs').BinaryServer;
const server = binaryServer({port: 9001});


var fileWriter = null;
var playStream = null;
var recognizeStream = null;
var isAnalyzing = false;

server.on('connection', function (client) {
  console.log( "Connected!!!" );

  client.on('stream', function (stream, meta) {
    switch(meta.event) {
      case 'recording':
        console.log( "recording event!!!" );
        isAnalyzing = false;
        fileWriter = new wav.FileWriter(meta.fileName, {
          channels: 1,
          sampleRate: meta.sampleRate,
          bitDepth: 16
        });

        try {
          stream.pipe(fileWriter);
        }
        catch(e)  {
          console.error( "writer error: " + e );
        }

        stream.on('pause', function () {
          console.log( "pause & ask event!!! isAnalyzing: " + isAnalyzing );
          fileWriter.end();

          if( !isAnalyzing )  {
            isAnalyzing = true;
            streamingRecognize(meta, stream);
          }
        });

        stream.on('end', function() {
          console.log( "end recording & streaming... !!!" );
          fileWriter.end();
          // writeStream.end();
        });
        break;

      // request for a audio
      case 'play':
        // if( playStream )  {
        //   playStream.end();
        //   playStream = null;
        // }
        console.log( "play event!!!" );
        console.log( "request: " + meta.fileName );
        playStream = fs.createReadStream(meta.fileName);
        client.send(playStream);
        break;

      default:
        console.log( "unknown request event!!!: " + meta.event );
        break;
    }
  });

  client.on('close', function() {
    console.log( "close streaming!!!" );
    clearStream();
  });

});

function clearStream()  {
  if( recognizeStream ) {
    recognizeStream.end();
    recognizeStream = null;
  }

  if (fileWriter) {
    fileWriter.end();
    fileWriter = null;
  }

  // if( playStream )  {
  //   playStream.end();
  //   playStream = null;
  // }
}

function streamingRecognize (meta, client) {
  console.log( "ask to google...: " + meta.fileName );

  const request = {
    config: {
      encoding: 'LINEAR16',
      sampleRate: meta.sampleRate,
      languageCode: meta.lang
    },
    singleUtterance: false,
    interimResults: false
  };


  // Stream the audio to the Google Cloud Speech API
  // const recognizeStream = speech.createRecognizeStream(request)
  recognizeStream = speech.createRecognizeStream(request)
    .on('error',console.error)
    .on('data', (data) => successSpeech(data, meta.target, client) );

  fs.createReadStream(meta.fileName).pipe(recognizeStream);
}

function successSpeech(data, target, client) {
  console.log('Data received: %j', data);

  if( data.results != "" ) {
    // console.log('Data received: %j', data);
    console.log('send Data: %j', data.results);
    translateText(data.results, target, client).then(function (transResult) {
      var result = {};

      transResult.forEach((translation, i) => {
        result.ori = data.results;
        result.dest = translation;
        result.target = target;
      })

      console.log( 'client.write: ' + JSON.stringify(result) );
      client.write( result );

      setTimeout(function(){ clearStream() }, WAITING_TIME);
      // clearStream();

  }, function (error) {

    });
  }
  isAnalyzing = false;
};

function translateText(input, target) {

  if (!Array.isArray(input)) {
    input = [input];
  }

  // Instantiates a client
  const translate = Translate({
    projectId: projectId
  });

  const options = {
    to: target
  };

  // console.log( 'trans: ' + input );
  // Translates the text into the target language. "input" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  return translate.translate(input, options)
    .then((results) => {
      let translations = results[0];
      translations = Array.isArray(translations) ? translations : [translations];

      // console.log('Translations:');
      // translations.forEach((translation, i) => {
      //     console.log(`${input[i]} => (${target}) ${translation}`);
      // });

      return translations;
    }, console.error );
}
