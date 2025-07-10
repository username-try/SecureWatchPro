import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ROISelector } from './roi-selector';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Camera, UpdateCameraSettings } from '@shared/schema';

interface CameraSettingsModalProps {
  camera: Camera | null;
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdate: (cameraId: number, settings: UpdateCameraSettings) => void;
}

export function CameraSettingsModal({ 
  camera, 
  isOpen, 
  onClose, 
  onSettingsUpdate 
}: CameraSettingsModalProps) {
  const [settings, setSettings] = useState<UpdateCameraSettings>({
    name: '',
    motionDetectionEnabled: false,
    nightVisionEnabled: false,
    resolution: '720p',
    frameRate: 24,
    roiX: 0.2,
    roiY: 0.2,
    roiWidth: 0.6,
    roiHeight: 0.6,
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (camera) {
      setSettings({
        name: camera.name,
        motionDetectionEnabled: camera.motionDetectionEnabled,
        nightVisionEnabled: camera.nightVisionEnabled,
        resolution: camera.resolution,
        frameRate: camera.frameRate,
        roiX: camera.roiX || 0.2,
        roiY: camera.roiY || 0.2,
        roiWidth: camera.roiWidth || 0.6,
        roiHeight: camera.roiHeight || 0.6,
        isActive: camera.isActive,
      });
    }
  }, [camera]);

  const handleSave = async () => {
    if (!camera) return;

    setIsSaving(true);
    try {
      await apiRequest('PUT', `/api/cameras/${camera.id}/settings`, settings);
      onSettingsUpdate(camera.id, settings);
      toast({
        title: "Settings saved",
        description: "Camera settings have been updated successfully.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save camera settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleROIChange = (roi: { x: number; y: number; width: number; height: number }) => {
    setSettings(prev => ({
      ...prev,
      roiX: roi.x,
      roiY: roi.y,
      roiWidth: roi.width,
      roiHeight: roi.height,
    }));
  };

  if (!camera) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900/95 backdrop-blur-lg border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Camera Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Camera Name */}
          <div>
            <Label htmlFor="cameraName" className="text-slate-300">Camera Name</Label>
            <Input
              id="cameraName"
              value={settings.name}
              onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
              className="bg-slate-800 border-slate-600 text-white focus:border-blue-500"
              placeholder="Enter camera name"
            />
          </div>

          {/* ROI Selection */}
          <div>
            <Label className="text-slate-300">Region of Interest (ROI)</Label>
            <div className="mt-2 p-4 bg-slate-800/50 rounded-lg">
              <ROISelector
                imageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=338"
                initialROI={{
                  x: settings.roiX || 0.2,
                  y: settings.roiY || 0.2,
                  width: settings.roiWidth || 0.6,
                  height: settings.roiHeight || 0.6,
                }}
                onROIChange={handleROIChange}
              />
              <p className="text-sm text-slate-400 mt-2">
                Drag to select the area for motion detection
              </p>
            </div>
          </div>

          {/* Settings Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white font-medium">Motion Detection</Label>
                <Switch
                  checked={settings.motionDetectionEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, motionDetectionEnabled: checked }))
                  }
                />
              </div>
              <p className="text-sm text-slate-400">Detect movement in ROI area</p>
            </div>

            <div className="bg-slate-800/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white font-medium">Night Vision</Label>
                <Switch
                  checked={settings.nightVisionEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, nightVisionEnabled: checked }))
                  }
                />
              </div>
              <p className="text-sm text-slate-400">Enhanced low-light visibility</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
