import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Video, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function CameraSetup() {
  const [, navigate] = useLocation();
  const [accessCode, setAccessCode] = useState('');
  const [cameraName, setCameraName] = useState('');
  const [streamQuality, setStreamQuality] = useState('720p');
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleStartCamera = async () => {
    if (!accessCode.trim()) {
      toast({
        title: "Access code required",
        description: "Please enter the monitor's access code.",
        variant: "destructive",
      });
      return;
    }

    if (!cameraName.trim()) {
      toast({
        title: "Camera name required",
        description: "Please enter a name for your camera.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Validate access code
      const validateResponse = await apiRequest('POST', '/api/monitors/validate', {
        accessCode: accessCode.trim(),
      });
      
      const { monitor } = await validateResponse.json();
      
      // Create camera
      const cameraResponse = await apiRequest('POST', '/api/cameras', {
        name: cameraName,
        monitorId: monitor.id,
        resolution: streamQuality,
        frameRate: streamQuality === 'high' ? 30 : 24,
        isActive: true,
        motionDetectionEnabled: false,
        nightVisionEnabled: false,
      });
      
      const camera = await cameraResponse.json();
      
      // Store camera info in localStorage
      localStorage.setItem('currentCamera', JSON.stringify(camera));
      localStorage.setItem('currentMonitor', JSON.stringify(monitor));
      
      toast({
        title: "Camera connected",
        description: `Successfully connected to ${monitor.name}`,
      });
      
      navigate('/camera-view');
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Invalid access code or connection error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

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
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Video className="text-white w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Camera Setup</h2>
                <p className="text-slate-300">Connect to a monitor using its access code</p>
              </div>
              
              {/* Access Code Input */}
              <div className="mb-6">
                <Label htmlFor="accessCode" className="block text-sm font-medium text-slate-300 mb-3">
                  Monitor Access Code
                </Label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Enter 20-character access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="bg-slate-700/50 text-white text-lg font-mono border-slate-600 focus:border-purple-500"
                />
                <p className="text-sm text-slate-400 mt-2">
                  Get this code from your monitor device
                </p>
              </div>
              
              {/* Camera Name Input */}
              <div className="mb-6">
                <Label htmlFor="cameraName" className="block text-sm font-medium text-slate-300 mb-3">
                  Camera Name
                </Label>
                <Input
                  id="cameraName"
                  type="text"
                  placeholder="Enter camera name (e.g., Front Door, Living Room)"
                  value={cameraName}
                  onChange={(e) => setCameraName(e.target.value)}
                  className="bg-slate-700/50 text-white border-slate-600 focus:border-purple-500"
                />
              </div>
              
              {/* Stream Quality Settings */}
              <div className="mb-8">
                <Label className="block text-sm font-medium text-slate-300 mb-3">
                  Stream Quality
                </Label>
                <Select value={streamQuality} onValueChange={setStreamQuality}>
                  <SelectTrigger className="bg-slate-700/50 text-white border-slate-600 focus:border-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="high">High (1080p)</SelectItem>
                    <SelectItem value="medium">Medium (720p)</SelectItem>
                    <SelectItem value="low">Low (480p)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-4">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleStartCamera}
                  disabled={isConnecting}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  {isConnecting ? 'Connecting...' : 'Start Camera'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
