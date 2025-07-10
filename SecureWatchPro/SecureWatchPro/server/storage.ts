import { monitors, cameras, motionEvents, type Monitor, type Camera, type MotionEvent, type InsertMonitor, type InsertCamera, type InsertMotionEvent, type UpdateCameraSettings } from "@shared/schema";

export interface IStorage {
  // Monitor operations
  createMonitor(monitor: InsertMonitor): Promise<Monitor>;
  getMonitorByAccessCode(accessCode: string): Promise<Monitor | undefined>;
  getMonitorById(id: number): Promise<Monitor | undefined>;
  
  // Camera operations
  createCamera(camera: InsertCamera): Promise<Camera>;
  getCamerasByMonitorId(monitorId: number): Promise<Camera[]>;
  getCameraById(id: number): Promise<Camera | undefined>;
  updateCameraSettings(id: number, settings: UpdateCameraSettings): Promise<Camera | undefined>;
  
  // Motion event operations
  createMotionEvent(event: InsertMotionEvent): Promise<MotionEvent>;
  getMotionEventsByCameraId(cameraId: number, limit?: number): Promise<MotionEvent[]>;
}

export class MemStorage implements IStorage {
  private monitors: Map<number, Monitor>;
  private cameras: Map<number, Camera>;
  private motionEvents: Map<number, MotionEvent>;
  private currentMonitorId: number;
  private currentCameraId: number;
  private currentMotionEventId: number;

  constructor() {
    this.monitors = new Map();
    this.cameras = new Map();
    this.motionEvents = new Map();
    this.currentMonitorId = 1;
    this.currentCameraId = 1;
    this.currentMotionEventId = 1;
  }

  async createMonitor(insertMonitor: InsertMonitor): Promise<Monitor> {
    const id = this.currentMonitorId++;
    const monitor: Monitor = {
      ...insertMonitor,
      id,
      createdAt: new Date(),
    };
    this.monitors.set(id, monitor);
    return monitor;
  }

  async getMonitorByAccessCode(accessCode: string): Promise<Monitor | undefined> {
    return Array.from(this.monitors.values()).find(
      (monitor) => monitor.accessCode === accessCode
    );
  }

  async getMonitorById(id: number): Promise<Monitor | undefined> {
    return this.monitors.get(id);
  }

  async createCamera(insertCamera: InsertCamera): Promise<Camera> {
    const id = this.currentCameraId++;
    const camera: Camera = {
      id,
      name: insertCamera.name,
      monitorId: insertCamera.monitorId,
      isActive: insertCamera.isActive ?? true,
      motionDetectionEnabled: insertCamera.motionDetectionEnabled ?? false,
      nightVisionEnabled: insertCamera.nightVisionEnabled ?? false,
      resolution: insertCamera.resolution ?? "720p",
      frameRate: insertCamera.frameRate ?? 24,
      roiX: insertCamera.roiX ?? 0.2,
      roiY: insertCamera.roiY ?? 0.2,
      roiWidth: insertCamera.roiWidth ?? 0.6,
      roiHeight: insertCamera.roiHeight ?? 0.6,
      createdAt: new Date(),
    };
    this.cameras.set(id, camera);
    return camera;
  }

  async getCamerasByMonitorId(monitorId: number): Promise<Camera[]> {
    return Array.from(this.cameras.values()).filter(
      (camera) => camera.monitorId === monitorId
    );
  }

  async getCameraById(id: number): Promise<Camera | undefined> {
    return this.cameras.get(id);
  }

  async updateCameraSettings(id: number, settings: UpdateCameraSettings): Promise<Camera | undefined> {
    const camera = this.cameras.get(id);
    if (!camera) return undefined;

    const updatedCamera: Camera = {
      ...camera,
      ...settings,
    };
    this.cameras.set(id, updatedCamera);
    return updatedCamera;
  }

  async createMotionEvent(insertMotionEvent: InsertMotionEvent): Promise<MotionEvent> {
    const id = this.currentMotionEventId++;
    const event: MotionEvent = {
      ...insertMotionEvent,
      id,
      createdAt: new Date(),
    };
    this.motionEvents.set(id, event);
    return event;
  }

  async getMotionEventsByCameraId(cameraId: number, limit = 50): Promise<MotionEvent[]> {
    return Array.from(this.motionEvents.values())
      .filter((event) => event.cameraId === cameraId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
