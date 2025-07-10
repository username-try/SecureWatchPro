import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Eye, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Camera } from '@shared/schema';

interface CameraCardProps {
  camera: Camera;
  onSettingsClick: (camera: Camera) => void;
  isLive?: boolean;
  motionDetected?: boolean;
  className?: string;
}

export function CameraCard({ 
  camera, 
  onSettingsClick, 
  isLive = false, 
  motionDetected = false,
  className 
}: CameraCardProps) {
  const getStatusColor = () => {
    if (motionDetected) return 'bg-yellow-400';
    if (isLive && camera.isActive) return 'bg-green-400';
    return 'bg-slate-400';
  };

  const getStatusText = () => {
    if (motionDetected) return 'Motion Detected';
    if (isLive && camera.isActive) return 'Online';
    return 'Offline';
  };

  return (
    <Card className={cn(
      "bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden group hover:bg-white/15 transition-all duration-300",
      className
    )}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Video feed area */}
          <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
            {/* Placeholder for video feed */}
            <div className="text-slate-400 text-center">
              <Eye className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Camera Feed</p>
            </div>
            
            {/* Live indicator */}
            {isLive && (
              <div className="absolute top-3 left-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                  LIVE
                </span>
              </div>
            )}
            
            {/* Motion detection overlay */}
            {motionDetected && (
              <div className="absolute inset-0 border-2 border-green-400 opacity-75 animate-pulse pointer-events-none" />
            )}
            
            {/* Settings button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              onClick={() => onSettingsClick(camera)}
            >
              <Settings className="w-4 h-4 text-white" />
            </Button>
          </div>
          
          {/* Camera info */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white">{camera.name}</h3>
              <div className="flex items-center space-x-2">
                <div className={cn("w-2 h-2 rounded-full", getStatusColor())} />
                <span className="text-sm text-slate-300">{getStatusText()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>
                Motion: {' '}
                <span className={camera.motionDetectionEnabled ? "text-green-400" : "text-slate-400"}>
                  {camera.motionDetectionEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </span>
              <span>
                Night Vision: {' '}
                <span className={camera.nightVisionEnabled ? "text-blue-400" : "text-slate-400"}>
                  {camera.nightVisionEnabled ? 'On' : 'Off'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
