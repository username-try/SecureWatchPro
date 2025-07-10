import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Shield, ArrowLeft, Pause, Play, Moon, Activity, Camera as CameraIcon } from 'lucide-react';
import { useWebSocket } from '@/hooks/use-websocket';
import { useToast } from '@/hooks/use-toast';
import type { Camera, Monitor } from '@shared/schema';

export default function CameraView() {
  const [, navigate] = useLocation();
  const [camera, setCamera] = useState<Camera | null>(null);
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [isRecording, setIsRecording] = useState(true);
  const [motionSensitivity, setMotionSensitivity] = useState([7]);
  const [irIntensity, setIrIntensity] = useState([8]);
  const [resolution, setResolution] = useState('720p');
  const [frameRate, setFrameRate] = useState('24');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // WebSocket connection
  const { send } = useWebSocket({
    onConnect: () => {
      const storedCamera = localStorage.getItem('currentCamera');
      if (storedCamera) {
        const parsedCamera = JSON.parse(storedCamera);
        send({
          type: 'join_camera',
          cameraId: parsedCamera.id
        });
      }
    },
  });

  // Load camera and monitor info on mount
  useEffect(() => {
    const storedCamera = localStorage.getItem('currentCamera');
    const storedMonitor = localStorage.getItem('currentMonitor');
    
    if (!storedCamera || !storedMonitor) {
      navigate('/');
      return;
    }

    const parsedCamera = JSON.parse(storedCamera);
    const parsedMonitor = JSON.parse(storedMonitor);
    
    setCamera(parsedCamera);
    setMonitor(parsedMonitor);
    setResolution(parsedCamera.resolution);
    setFrameRate(parsedCamera.frameRate.toString());
    
    // Initialize camera
    initializeCamera();
  }, [navigate]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 24 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Start streaming frames
      startFrameCapture();
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const startFrameCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    const captureFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);
        
        // Convert to base64 and send
        const frameData = canvas.toDataURL('image/jpeg', 0.8);
        send({
          type: 'camera_frame',
          frame: frameData
        });
      }
      
      if (isRecording) {
        requestAnimationFrame(captureFrame);
      }
    };

    captureFrame();
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      startFrameCapture();
    }
  };

  const toggleMotionDetection = () => {
    if (!camera) return;
    
    const newValue = !camera.motionDetectionEnabled;
    setCamera(prev => prev ? { ...prev, motionDetectionEnabled: newValue } : null);
    
    send({
      type: 'camera_settings_update',
      settings: { motionDetectionEnabled: newValue }
    });
  };

  const toggleNightVision = () => {
    if (!camera) return;
    
    const newValue = !camera.nightVisionEnabled;
    setCamera(prev => prev ? { ...prev, nightVisionEnabled: newValue } : null);
    
    send({
      type: 'camera_settings_update',
      settings: { nightVisionEnabled: newValue }
    });
  };

  const takeSnapshot = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `camera-snapshot-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg');
    link.click();
    
    toast({
      title: "Snapshot taken",
      description: "Image saved to your downloads folder.",
    });
  };

  if (!camera || !monitor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          <p className="text-white mt-4">Loading camera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SecureWatch Pro</h1>
              <p className="text-slate-300 text-sm">Professional Surveillance System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Camera Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="icon"
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-white">Camera: {camera.name}</h2>
                <p className="text-slate-300">Streaming to {monitor.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-white">
                  {isRecording ? 'Recording' : 'Paused'}
                </span>
              </div>
              <Button
                onClick={toggleRecording}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                {isRecording ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isRecording ? 'Pause' : 'Resume'}
              </Button>
            </div>
          </div>
          
          {/* Camera Preview */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden mb-6">
            <CardContent className="p-0">
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  
                  {/* Camera controls overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={toggleNightVision}
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30"
                      >
                        <Moon className="w-5 h-5 text-white" />
                      </Button>
                      <Button
                        onClick={toggleMotionDetection}
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30"
                      >
                        <Activity className="w-5 h-5 text-white" />
                      </Button>
                      <Button
                        onClick={takeSnapshot}
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30"
                      >
                        <CameraIcon className="w-5 h-5 text-white" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Status indicators */}
                  <div className="absolute top-4 left-4 flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-white text-sm">LIVE</span>
                    </div>
                    {camera.nightVisionEnabled && (
                      <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                        <Moon className="w-4 h-4 text-blue-400" />
                        <span className="text-white text-sm">Night Vision</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Camera Settings Panel */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Motion Detection */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Motion Detection</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Enable Detection</Label>
                    <Switch
                      checked={camera.motionDetectionEnabled}
                      onCheckedChange={toggleMotionDetection}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm text-slate-300 mb-2">Sensitivity</Label>
                    <Slider
                      value={motionSensitivity}
                      onValueChange={setMotionSensitivity}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="text-sm text-slate-400">
                    <span>Events detected: <span className="text-white font-medium">0</span></span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Night Vision */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Night Vision</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Enable Night Vision</Label>
                    <Switch
                      checked={camera.nightVisionEnabled}
                      onCheckedChange={toggleNightVision}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm text-slate-300 mb-2">IR Intensity</Label>
                    <Slider
                      value={irIntensity}
                      onValueChange={setIrIntensity}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="text-sm text-slate-400">
                    <span>Auto-adjust: <span className="text-green-400">Enabled</span></span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Stream Quality */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Stream Quality</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm text-slate-300 mb-2">Resolution</Label>
                    <Select value={resolution} onValueChange={setResolution}>
                      <SelectTrigger className="bg-slate-700/50 text-white border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                        <SelectItem value="720p">720p (HD)</SelectItem>
                        <SelectItem value="480p">480p (SD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="block text-sm text-slate-300 mb-2">Frame Rate</Label>
                    <Select value={frameRate} onValueChange={setFrameRate}>
                      <SelectTrigger className="bg-slate-700/50 text-white border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="30">30 FPS</SelectItem>
                        <SelectItem value="24">24 FPS</SelectItem>
                        <SelectItem value="15">15 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-slate-400">
                    <span>Bitrate: <span className="text-white font-medium">2.5 Mbps</span></span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
