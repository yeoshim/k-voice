/**
 * Created by yeoshim on 2017. 2. 26..
 */
'use strict';

app.controller('appCtrl', function ($rootScope, $scope, $log, ionicMaterialInk, $sce, Loading, $window) {
  $log.info( "Load AppCtrl" );
  ionicMaterialInk.displayEffect();

  var scopeApply = function (fn) {
    var phase = $scope.$root.$$phase;
    if (phase !== '$apply' && phase !== '$digest') {
      return $scope.$apply(fn);
    }
  };

  $scope.width = $window.innerWidth;

  const serverHost = 'localhost';
  var fileName = 'testWave';

  var isPlayable = false;
  var isRecording = false;

  var binaryClient = null;
  var clientStream = null;

  const SAMPLE_RATE = 44100;

  const WAITING_TIME = 10000;  //  10 sec
  var isWating = false;

  const INIT_MSG = '마이크 버튼을 누르고 말하세요.';
  const SUCCESS_MSG = '성공!!! 해드셋 버튼을 누르면 재생됩니다.';
  const FAIL_MSG = '인식(분석)에 실패하였습니다. 다시 시도하세요...';
  const SPEAK_MSG = '말하세요';

  $scope.text = {
    header: INIT_MSG,
    body: '',
    footer: ''
  };

  $rootScope.isSupported = true;
  $scope.audioSrc = null;

  initRecorder();


  $scope.isSuccess = function () {
    return $scope.text.header == SUCCESS_MSG;
  };

  $scope.isPlayable = function () {
    return isPlayable;
  };

  $scope.isRecording = function () {
    return isRecording;
  };
/////////////////////////////////////////
//  for user events
  $scope.startRecord = function (speechType) {
    if( isWating )  {
      $log.info( "wating google...!!!" );
      return;
    }
    $log.info( "Start recording!!!" );
    initText();
    initClient( speechType );
    $scope.text.header = SPEAK_MSG;
  };

  function queryToServer() {
    isRecording = false;

    $scope.text.header = '분석중...';
    Loading.show("Analysis...").then(function()  {
      $log.info( 'clientStream.pause()' );
      isWating = true;
      clientStream.pause();
    });

    setTimeout(function(){  //  time-out case...
      Loading.hide();
      if( isWating )  {
        $scope.text.header = FAIL_MSG;
        closeClient();
      }
    }, WAITING_TIME);
  }

  $scope.play = function () {
    Loading.show("Init Streaming...").then(function()  {
      $log.info( 'play init stream!!!' );
      initClient( 'play' );
    });
  };

  function emit(event, data, file) {
    file       = file || {};
    data       = data || {};
    data.event = event;

    return binaryClient.send(file, data);
  }

/////////////////////////////////////////

/////////////////////////////////////////
//  functions
  function initText() {
    $scope.text = {
      header: INIT_MSG,
      body: '',
      footer: ''
    }
  }

  function initClient(type) {
    isPlayable = false;

    binaryClient = new BinaryClient('ws://'+serverHost+':9001');

    binaryClient.on('open', function () {
      $log.info('open client!!!');

      var langCode = 'ko-KR'; //  default lang is ko
      var target = 'en';
      switch (type) {
        case 'en-speech':
          langCode = 'en-US';
          target = 'ko';
        case 'ko-speech':
          fileName = new Date().getTime() +'.wav';
          var options = {
            fileName: fileName,
            event: 'recording',
            lang: langCode,
            target: target,
            sampleRate: SAMPLE_RATE
          };

          clientStream = binaryClient.createStream(options);

          isRecording = true;
          scopeApply();

          //  receive result...
          clientStream.on('data', function(data) { //  receive text
            Loading.hide();
            $log.info("stream: " + data);
            $scope.text.header = SUCCESS_MSG;
            $scope.text.body = data.ori;
            $scope.text.footer = '(' + data.target + ') ' + data.dest;
            scopeApply();
            closeClient();
          });
          break;
        case 'play':
          binaryClient.on('stream', function (stream) {
            $log.info( "stream event!!!" );
            pipeline(stream, function (err, src) {
              $scope.audioSrc = $sce.trustAsResourceUrl(src);
              isPlayable = true;
              scopeApply();

              Loading.hide();
            });
          });
          emit('play', { fileName: fileName });
          break;
        default:
          $log.info( "unknown speech type: " + type );
          break;
      }
    });
  }

  function closeClient() {
    $log.info( "Clear Client!!!" );

    if( binaryClient )  {
      binaryClient.close();
      binaryClient = null;
    }
    isRecording = false;
    isWating = false;
    $scope.audioSrc = null;
  }


  function pipeline(stream, cb) {
    var parts = [];

    stream.on('data', function (data) {
      // $log.info( "get stream!!!" );
      parts.push(data);
    });

    stream.on('error', function (err) {
      cb(err);
    });

    stream.on('end', function () {
      var src = (window.URL || window.webkitURL).createObjectURL(new Blob(parts));
      cb(null, src);
    });
  }


  function initRecorder() {

    ///////////////////////////////
    //  for checking...
    const SPEAK_TIME = 8;  //  안녕
    const END_SPEAK_TIME = 15;
    const SPEAK_VOL = 10;
    const NOSPEAK_VOL = 1;

    var speakCnt = 0;
    var noSpeakCnt = 0;

    var analyserNode = null;
    var dataArray = null;

    //  for Visualization...
    var drawVisual;
    var canvas = document.querySelector('.visualizer');
    var canvasCtx = canvas.getContext("2d");

    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;
    ///////////////////////////////

    try {
      var session = {
        audio: true,
        video: false
      };
      navigator.getUserMedia(session, initializeRecorder, onError);
    }
    catch (e) {
      alert( "Your browser does not support this feature natively, please use latest version of Google Chrome." );
    }

    function initializeRecorder(stream) {
      var context = new (window.AudioContext || window.webkitAudioContext)();
      var audioInput = context.createMediaStreamSource(stream);
      var bufferSize = 2048;

      analyserNode = context.createAnalyser();

      // create a javascript node
      var recorder = (context.createScriptProcessor ||
      context.createJavaScriptNode).call(context, bufferSize, 1, 1);

      // specify the processing function
      recorder.onaudioprocess = recorderProcess;

      // connect stream to our recorder
      audioInput.connect(recorder);
      // connect our recorder to the previous destination
      recorder.connect(context.destination);

      audioInput.connect(analyserNode);

      visualize();
    }

    function visualize() {
      WIDTH = canvas.width;
      HEIGHT = canvas.height;

      analyserNode.fftSize = 1024;
      var bufferLength = analyserNode.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

      function draw() {
        drawVisual = requestAnimationFrame(draw);

        analyserNode.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        var barWidth = (WIDTH / bufferLength) * 2.5;
        var barHeight;
        var x = 0;

        for(var i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];

          canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
          canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

          x += barWidth + 1;
        }
      }
      draw();
    }

    function onError(err) {
      $log.error( err );
    }

    function getAverageVolume(array) {
      if( !array )  return 0;

      var values = 0;
      var average;
      var length = array.length;

      // get all the frequency amplitudes
      for (var i = 0; i < length; i++) {
        values += array[i];
      }

      average = values / length;
      return average;
    }


    function recorderProcess(e) {
      if( !isRecording )  return;

      var leftAudio = e.inputBuffer.getChannelData(0);
      if( clientStream && clientStream.writable ) {
        clientStream.write( convertFloat32ToInt16(leftAudio) );
      }

      //  for check speaking...
      var avgVol = getAverageVolume(dataArray);

      if( avgVol > SPEAK_VOL )  { //  count speaking...
        speakCnt += 1;
      }

      if( avgVol < NOSPEAK_VOL )  {
        if( speakCnt > SPEAK_TIME ) {
          if( noSpeakCnt > END_SPEAK_TIME ) { //  is end speak?....
            $log.info( "queryToServer!!!" );
            queryToServer();
            speakCnt = 0;
            noSpeakCnt = 0;
          }
        }
        else  {
          //  not yet speak
        }
        noSpeakCnt += 1;
      }
    }

    function convertFloat32ToInt16(buffer) {
      var l = buffer.length;
      var buf = new Int16Array(l);
      while (l--) {
        buf[l] = Math.min(1, buffer[l])*0x7FFF;
      }
      return buf.buffer;
    }

  }

});

