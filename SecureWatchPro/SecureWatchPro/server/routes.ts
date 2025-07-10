import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertMonitorSchema, insertCameraSchema, updateCameraSettingsSchema, insertMotionEventSchema } from "@shared/schema";
import { z } from "zod";

// Generate random 20-character access code
function generateAccessCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// WebSocket connection tracking
interface WebSocketConnection {
  ws: WebSocket;
  type: 'monitor' | 'camera';
  id: string;
  room?: string;
}

const connections = new Map<string, WebSocketConnection>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    const connectionId = Math.random().toString(36).substr(2, 9);
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'join_monitor':
            connections.set(connectionId, {
              ws,
              type: 'monitor',
              id: data.monitorId,
              room: `monitor_${data.monitorId}`
            });
            break;
            
          case 'join_camera':
            connections.set(connectionId, {
              ws,
              type: 'camera',
              id: data.cameraId,
              room: `camera_${data.cameraId}`
            });
            break;
            
          case 'camera_frame':
            // Broadcast frame to monitor
            const cameraConn = connections.get(connectionId);
            if (cameraConn?.type === 'camera') {
              const camera = await storage.getCameraById(parseInt(cameraConn.id));
              if (camera) {
                broadcastToRoom(`monitor_${camera.monitorId}`, {
                  type: 'camera_frame',
                  cameraId: camera.id,
                  frame: data.frame
                });
              }
            }
            break;
            
          case 'motion_detected':
            // Handle motion detection
            const motionCameraConn = connections.get(connectionId);
            if (motionCameraConn?.type === 'camera') {
              const camera = await storage.getCameraById(parseInt(motionCameraConn.id));
              if (camera) {
                // Store motion event
                await storage.createMotionEvent({
                  cameraId: camera.id,
                  confidence: data.confidence,
                  boundingBoxX: data.boundingBox.x,
                  boundingBoxY: data.boundingBox.y,
                  boundingBoxWidth: data.boundingBox.width,
                  boundingBoxHeight: data.boundingBox.height
                });
                
                // Broadcast to monitor
                broadcastToRoom(`monitor_${camera.monitorId}`, {
                  type: 'motion_detected',
                  cameraId: camera.id,
                  confidence: data.confidence,
                  boundingBox: data.boundingBox
                });
              }
            }
            break;
            
          case 'camera_settings_update':
            // Broadcast settings update
            const settingsCameraConn = connections.get(connectionId);
            if (settingsCameraConn?.type === 'camera') {
              const camera = await storage.getCameraById(parseInt(settingsCameraConn.id));
              if (camera) {
                broadcastToRoom(`monitor_${camera.monitorId}`, {
                  type: 'camera_settings_update',
                  cameraId: camera.id,
                  settings: data.settings
                });
              }
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      connections.delete(connectionId);
    });
  });
  
  function broadcastToRoom(room: string, message: any) {
    connections.forEach((conn) => {
      if (conn.room === room && conn.ws.readyState === WebSocket.OPEN) {
        conn.ws.send(JSON.stringify(message));
      }
    });
  }

  // Monitor routes
  app.post('/api/monitors', async (req, res) => {
    try {
      // Use the access code from request body if provided, otherwise generate one
      const accessCode = req.body.accessCode || generateAccessCode();
      const validatedData = insertMonitorSchema.parse({
        ...req.body,
        accessCode
      });
      
      const monitor = await storage.createMonitor(validatedData);
      console.log(`Created monitor with access code: ${monitor.accessCode}`);
      res.json(monitor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create monitor' });
      }
    }
  });

  app.post('/api/monitors/validate', async (req, res) => {
    try {
      const { accessCode } = req.body;
      if (!accessCode) {
        return res.status(400).json({ error: 'Access code is required' });
      }
      
      console.log(`Validating access code: ${accessCode}`);
      const monitor = await storage.getMonitorByAccessCode(accessCode);
      console.log(`Found monitor:`, monitor ? `ID ${monitor.id}` : 'null');
      
      if (!monitor) {
        return res.status(404).json({ error: 'Invalid access code' });
      }
      
      res.json({ valid: true, monitor });
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({ error: 'Failed to validate access code' });
    }
  });

  app.get('/api/monitors/:id/cameras', async (req, res) => {
    try {
      const monitorId = parseInt(req.params.id);
      const cameras = await storage.getCamerasByMonitorId(monitorId);
      res.json(cameras);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch cameras' });
    }
  });

  // Camera routes
  app.post('/api/cameras', async (req, res) => {
    try {
      const validatedData = insertCameraSchema.parse(req.body);
      const camera = await storage.createCamera(validatedData);
      res.json(camera);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create camera' });
      }
    }
  });

  app.put('/api/cameras/:id/settings', async (req, res) => {
    try {
      const cameraId = parseInt(req.params.id);
      const validatedData = updateCameraSettingsSchema.parse(req.body);
      
      const camera = await storage.updateCameraSettings(cameraId, validatedData);
      if (!camera) {
        return res.status(404).json({ error: 'Camera not found' });
      }
      
      res.json(camera);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to update camera settings' });
      }
    }
  });

  app.get('/api/cameras/:id', async (req, res) => {
    try {
      const cameraId = parseInt(req.params.id);
      const camera = await storage.getCameraById(cameraId);
      if (!camera) {
        return res.status(404).json({ error: 'Camera not found' });
      }
      res.json(camera);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch camera' });
    }
  });

  app.get('/api/cameras/:id/motion-events', async (req, res) => {
    try {
      const cameraId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const events = await storage.getMotionEventsByCameraId(cameraId, limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch motion events' });
    }
  });

  return httpServer;
}
