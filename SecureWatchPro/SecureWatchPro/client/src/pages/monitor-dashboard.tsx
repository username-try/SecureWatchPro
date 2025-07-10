import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Plus, Activity, Video, Eye, Moon } from 'lucide-react';
import { CameraCard } from '@/components/camera-card';
import { CameraSettingsModal } from '@/components/camera-settings-modal';
import { useWebSocket } from '@/hooks/use-websocket';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Monitor, Camera, UpdateCameraSettings } from '@shared/schema';

export default function MonitorDashboard() {
  const [, navigate] = useLocation();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [motionDetectedCameras, setMotionDetectedCameras] = useState<Set<number>>(new Set());
  const [activeCameras, setActiveCameras] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // WebSocket connection
  const { send } = useWebSocket({
    onMessage: (data) => {
      switch (data.type) {
        case 'camera_frame':
          setActiveCameras(prev => new Set(prev).add(data.cameraId));
          break;
        case 'motion_detected':
          setMotionDetectedCameras(prev => new Set(prev).add(data.cameraId));
          // Clear motion detection after 5 seconds
          setTimeout(() => {
            setMotionDetectedCameras(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.cameraId);
              return newSet;
            });
          }, 5000);
          break;
        case 'camera_settings_update':
          loadCameras();
          break;
      }
    },
    onConnect: () => {
      // Join monitor room when connected
      const storedMonitor = localStorage.getItem('currentMonitor');
      if (storedMonitor) {
        const parsedMonitor = JSON.parse(storedMonitor);
        send({
          type: 'join_monitor',
          monitorId: parsedMonitor.id
        });
      }
    },
  });

  // Load monitor and cameras on mount
  useEffect(() => {
    const storedMonitor = localStorage.getItem('currentMonitor');
    if (!storedMonitor) {
      navigate('/');
      return;
    }

    const parsedMonitor = JSON.parse(storedMonitor);
    setMonitor(parsedMonitor);
    loadCameras();
  }, [navigate]);

  const loadCameras = async () => {
    const storedMonitor = localStorage.getItem('currentMonitor');
    if (!storedMonitor) return;

    const parsedMonitor = JSON.parse(storedMonitor);
    try {
      const response = await apiRequest('GET', `/api/monitors/${parsedMonitor.id}/cameras`, {});
      const camerasData = await response.json();
      setCameras(camerasData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cameras",
        variant: "destructive",
      });
    }
  };

  const handleCameraSettings = (camera: Camera) => {
    setSelectedCamera(camera);
    setIsSettingsModalOpen(true);
  };

  const handleSettingsUpdate = async (cameraId: number, settings: UpdateCameraSettings) => {
    setCameras(prev =>
      prev.map(camera =>
        camera.id === cameraId ? { ...camera, ...settings } : camera
      )
    );
  };

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  if (!monitor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          <p className="text-white mt-4">Loading dashboard...</p>
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
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white">Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Security Dashboard</h2>
              <p className="text-slate-300">Monitor: <span className="font-semibold">{monitor.name}</span></p>
              <p className="text-slate-300">Access Code: <span className="font-mono text-blue-300">{monitor.accessCode}</span></p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm text-slate-300">Active Cameras: </span>
                <span className="font-semibold text-white">{cameras.length}</span>
              </div>
            </div>
          </div>
          
          {/* Camera Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {/* Connected Cameras */}
            {cameras.map((camera) => (
              <CameraCard
                key={camera.id}
                camera={camera}
                onSettingsClick={handleCameraSettings}
                isLive={activeCameras.has(camera.id)}
                motionDetected={motionDetectedCameras.has(camera.id)}
              />
            ))}
            
            {/* Empty Camera Slots */}
            {Array.from({ length: Math.max(0, 6 - cameras.length) }, (_, index) => (
              <Card key={`empty-${index}`} className="bg-white/5 backdrop-blur-lg border-white/10 border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Video className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-400 mb-2">Camera Slot {cameras.length + index + 1}</h3>
                  <p className="text-sm text-slate-500">
                    Waiting for camera connection
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Activity Feed */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No recent activity</p>
                    <p className="text-sm text-slate-500">Motion events and camera connections will appear here</p>
                  </div>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                      <div className={`w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center`}>
                        <activity.icon className={`w-5 h-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.message}</p>
                        <p className="text-sm text-slate-400">{activity.time}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Camera Settings Modal */}
      <CameraSettingsModal
        camera={selectedCamera}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSettingsUpdate={handleSettingsUpdate}
      />
    </div>
  );
}
