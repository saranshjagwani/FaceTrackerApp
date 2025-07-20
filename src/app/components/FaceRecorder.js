"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

/**
 * FaceRecorder Component
 * 
 * A responsive React component that provides real-time face detection and recording functionality.
 * Features include:
 * - Live face detection with landmarks overlay
 * - Video recording with face detection overlay
 * - Responsive design that adapts to different screen sizes
 * - Loading states and error handling
 * - Download functionality for recorded videos
 */
const FaceRecorder = () => {
  // Refs for DOM elements
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const detectionIntervalRef = useRef(null);
  const streamRef = useRef(null);

  // Component state
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Responsive video dimensions
  const [videoDimensions, setVideoDimensions] = useState({
    width: 640,
    height: 480
  });

  /**
   * Calculate responsive video dimensions based on screen size
   */
  const calculateDimensions = useCallback(() => {
    const maxWidth = Math.min(window.innerWidth - 40, 800);
    const aspectRatio = 4 / 3;
    const width = maxWidth;
    const height = width / aspectRatio;
    
    setVideoDimensions({ width, height });
  }, []);

  /**
   * Load face detection models from the public directory
   */
  const loadModels = useCallback(async () => {
    try {
      setError(null);
      const MODEL_URL = '/models';
      
      // Load required models for face detection and landmarks
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(`${MODEL_URL}/tiny_face_detector/model.json`),
        faceapi.nets.faceLandmark68Net.loadFromUri(`${MODEL_URL}/face_landmark_68/model.json`)
      ]);
      
      setModelsLoaded(true);
      console.log('Face detection models loaded successfully');
    } catch (err) {
      console.error('Error loading models:', err);
      setError('Failed to load face detection models. Please ensure model files are in the /public/models directory.');
    }
  }, []);

  /**
   * Initialize camera stream
   */
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // Request camera access with optimal settings
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: videoDimensions.width },
          height: { ideal: videoDimensions.height },
          facingMode: 'user'
        },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  }, [videoDimensions]);

  /**
   * Setup face detection overlay canvas
   */
  const setupCanvas = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = faceapi.createCanvasFromMedia(videoRef.current);
    canvasRef.current.innerHTML = '';
    canvasRef.current.appendChild(canvas);
    
    // Match canvas dimensions to video
    faceapi.matchDimensions(canvas, videoDimensions);
    
    return canvas;
  }, [videoDimensions]);

  /**
   * Start face detection loop
   */
  const startFaceDetection = useCallback(async () => {
    const canvas = setupCanvas();
    if (!canvas) return;

    // Clear any existing interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !modelsLoaded) return;

      try {
        // Detect faces with landmarks
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.5
          }))
          .withFaceLandmarks();

        // Update face detection state
        setFaceDetected(detections.length > 0);

        // Resize results to match display size
        const resizedDetections = faceapi.resizeResults(detections, videoDimensions);
        
        // Clear previous drawings
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, videoDimensions.width, videoDimensions.height);
        
        // Draw detection boxes and landmarks
        if (resizedDetections.length > 0) {
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }
      } catch (err) {
        console.error('Face detection error:', err);
      }
    }, 100); // 10 FPS for smooth detection
  }, [modelsLoaded, videoDimensions, setupCanvas]);

  /**
   * Start recording the canvas stream
   */
  const startRecording = useCallback(() => {
    if (!canvasRef.current?.firstChild) {
      setError('Canvas not ready for recording');
      return;
    }

    try {
      // Capture canvas stream for recording
      const canvasStream = canvasRef.current.firstChild.captureStream(30); // 30 FPS
      const recorder = new MediaRecorder(canvasStream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      recorderRef.current = recorder;
      recordedChunks.current = [];
      
      // Handle recording data
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };
      
      // Handle recording completion
      recorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        setRecordingTime(0);
      };
      
      recorder.start(100); // Collect data every 100ms
      setRecording(true);
      setError(null);
      
      console.log('Recording started');
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to start recording');
    }
  }, []);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    if (recorderRef.current && recording) {
      recorderRef.current.stop();
      setRecording(false);
      console.log('Recording stopped');
    }
  }, [recording]);

  /**
   * Clean up resources
   */
  const cleanup = useCallback(() => {
    // Stop detection interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Clean up video URL
    if (videoURL) {
      URL.revokeObjectURL(videoURL);
    }
  }, [videoURL]);

  // Recording timer effect
  useEffect(() => {
    let timer;
    if (recording) {
      timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [recording]);

  // Initialize component
  useEffect(() => {
    calculateDimensions();
    loadModels();
    
    // Handle window resize
    const handleResize = () => calculateDimensions();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, [calculateDimensions, loadModels, cleanup]);

  // Start camera when models are loaded
  useEffect(() => {
    if (modelsLoaded) {
      startCamera();
    }
  }, [modelsLoaded, startCamera]);

  // Start face detection when video is ready
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      if (modelsLoaded && cameraReady) {
        startFaceDetection();
      }
    };

    video.addEventListener('play', handlePlay);
    return () => video.removeEventListener('play', handlePlay);
  }, [modelsLoaded, cameraReady, startFaceDetection]);

  /**
   * Format recording time for display
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Face Detection Recorder</h1>
          <p className="text-gray-600">Real-time face detection with recording capabilities</p>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center space-x-4 mb-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            modelsLoaded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              modelsLoaded ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
            }`} />
            <span>{modelsLoaded ? 'Models Loaded' : 'Loading Models...'}</span>
          </div>
          
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            cameraReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              cameraReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
            }`} />
            <span>{cameraReady ? 'Camera Ready' : 'Starting Camera...'}</span>
          </div>
          
          {cameraReady && (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              faceDetected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                faceDetected ? 'bg-blue-500' : 'bg-gray-400'
              }`} />
              <span>{faceDetected ? 'Face Detected' : 'No Face Detected'}</span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Video Display */}
        <div className="flex justify-center mb-6">
          <div 
            className="relative bg-gray-900 rounded-xl overflow-hidden shadow-lg"
            style={{ 
              width: `${videoDimensions.width}px`, 
              height: `${videoDimensions.height}px`,
              maxWidth: '100%'
            }}
          >
            {/* Video Element */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              width={videoDimensions.width}
              height={videoDimensions.height}
              className="w-full h-full object-cover"
            />
            
            {/* Canvas Overlay for Face Detection */}
            <div 
              ref={canvasRef} 
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
            
            {/* Recording Indicator */}
            {recording && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg flex items-center space-x-2 animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full" />
                <span className="font-medium">REC {formatTime(recordingTime)}</span>
              </div>
            )}
            
            {/* Loading Overlay */}
            {(!modelsLoaded || !cameraReady) && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                  <p>{!modelsLoaded ? 'Loading AI models...' : 'Starting camera...'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          {!recording ? (
            <button
              onClick={startRecording}
              disabled={!modelsLoaded || !cameraReady}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              <span>Stop Recording</span>
            </button>
          )}
          
          {videoURL && (
            <a
              href={videoURL}
              download={`face_recording_${new Date().toISOString().slice(0, 19)}.webm`}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 no-underline"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Download Video</span>
            </a>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Instructions:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Ensure your face is well-lit and visible to the camera</li>
            <li>• The blue overlay shows detected face landmarks in real-time</li>
            <li>• Click "Start Recording" to capture video with face detection overlay</li>
            <li>• Recorded videos include the face detection visualization</li>
            <li>• Downloads are saved in WebM format for optimal quality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FaceRecorder;