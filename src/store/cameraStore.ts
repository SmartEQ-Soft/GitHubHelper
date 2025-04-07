import { create } from "zustand";
import wsManager from "@/lib/websocket";

export interface Camera {
  name: string;
  cameraIp: string;
  username: string;
  password: string;
  mediaUri: string;
  subUri: string;
  recordUri: string;
  mainSnapShot: string;
  subSnapShot: string;
  status?: boolean;
  recordcodec?: string;
  recordwidth?: number;
  recordheight?: number;
  subcodec?: string;
  subwidth?: number;
  subheight?: number;
  soundRec?: boolean;
  lastSnapshot?: string;
  // Store which slave this camera belongs to
  slaveId?: string;
}

export interface SlaveDevice {
  id: string; // Using MAC address as ID
  connected: number;
  ipv4: string;
  ipv6: string;
  lastSeenAt: string;
  uptime: string;
  isError: number;
  cameras: Camera[];
  testFinished: number;
  testFinishedAt: string;
}

// Store state
interface CameraState {
  // Data states
  allCameras: Camera[];
  slaveDevices: SlaveDevice[];
  uniqueCameras: Camera[]; // Unique cameras by name
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  autoScan: boolean;

  // Actions
  fetchCameras: () => void;
  startMonitoringCameras: () => void;
  stopMonitoringCameras: () => void;
  setAutoScan: (enabled: boolean) => void;
  clearError: () => void;
}

// Create system store
const useCameraStore = create<CameraState>((set, get) => ({
  // Initial state - Starting with empty arrays
  allCameras: [],
  slaveDevices: [],
  uniqueCameras: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  autoScan: true,

  // Fetch camera information
  fetchCameras: () => {
    set({ isLoading: true, error: null });
    try {
      // Check WebSocket connection
      if (wsManager.getStatus() !== "open") {
        set({
          isLoading: false,
          error: "WebSocket connection lost, please log in again",
        });
        return;
      }

      // Send DO MONITORECS command
      const success = wsManager.sendMessage("DO MONITORECS");

      if (!success) {
        set({
          isLoading: false,
          error: "Failed to send camera information request",
        });
        return;
      }

      // Also get auto scan status
      wsManager.sendMessage("DO MONITOR configuration");

      set({ isLoading: false, lastUpdated: new Date() });
    } catch (error) {
      console.error("Error fetching camera information:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  },

  // Start camera monitoring
  startMonitoringCameras: () => {
    try {
      // Check WebSocket connection
      if (wsManager.getStatus() !== "open") {
        set({
          error: "WebSocket connection lost, please log in again",
        });
        return;
      }

      // Remove previous listener
      wsManager.removeMessageListener(handleCameraMessage);

      // Add new listener
      wsManager.addMessageListener(handleCameraMessage);

      // Send DO MONITORECS command
      const success = wsManager.sendMessage("DO MONITORECS");

      console.log("DO MONITORECS sent, success:", success);

      // Also get auto scan status
      wsManager.sendMessage("DO MONITOR configuration");

      if (!success) {
        set({
          error: "Failed to start camera monitoring",
        });
      }
    } catch (error) {
      console.error("Error starting camera monitoring:", error);
      set({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  },

  // Stop camera monitoring
  stopMonitoringCameras: () => {
    wsManager.removeMessageListener(handleCameraMessage);
  },

  // Set auto scan status
  setAutoScan: (enabled: boolean) => {
    try {
      wsManager.sendMessage(
        `DO SETBOOL configuration.autoscan ${enabled}`
      );
      set({ autoScan: enabled });
    } catch (error) {
      console.error("Error setting auto scan:", error);
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

// Function to handle camera messages
const handleCameraMessage = (message: string) => {
  try {
    // Log raw message for debugging
    console.log("Camera message received:", message);

    // Is this a message about slave camera data?
    if (message.includes('{"c":"changed", "data":"ecs.slaves')) {
      processCameraChangeMessage(message);
    }

    // Is this a message containing configuration info?
    if (message.includes('{"c":"changed", "data":"configuration.autoscan"')) {
      processConfigurationMessage(message);
    }
  } catch (error) {
    console.error("Error processing camera message:", error);
  }
};

// Process camera change message
const processCameraChangeMessage = (message: string) => {
  try {
    const data = JSON.parse(message);

    if (
      data.c === "changed" &&
      data.data &&
      data.data.startsWith("ecs.slaves")
    ) {
      // Split changed data path
      const parts = data.data.split(".");

      // Get slave ID
      if (parts.length >= 3) {
        const slaveId = parts[2]; // E.g. m_32_BC_19_56_CE_FD

        // Get slave devices and current state
        const { slaveDevices } = useCameraStore.getState();

        // Find or create slave device
        let slaveDevice = slaveDevices.find((s) => s.id === slaveId);

        if (!slaveDevice) {
          slaveDevice = {
            id: slaveId,
            connected: 0,
            ipv4: "",
            ipv6: "",
            lastSeenAt: "",
            uptime: "",
            isError: 0,
            cameras: [],
            testFinished: 0,
            testFinishedAt: "",
          };

          // Add new slave device to list
          slaveDevices.push(slaveDevice);
        }

        // Update value based on data path
        updateSlaveDeviceProperty(
          slaveDevice,
          parts.slice(3).join("."),
          data.val
        );

        // Update unique cameras by collecting all cameras from all slaves
        const allCameras: Camera[] = [];

        slaveDevices.forEach((device) => {
          device.cameras.forEach((camera) => {
            // Add slaveId to each camera for reference
            camera.slaveId = device.id;
            allCameras.push(camera);
          });
        });

        // Create unique camera list by camera name
        // If there are duplicate camera names, take the one from the most recently seen slave
        const uniqueCameraMap = new Map<string, Camera>();

        // Sort slave devices by lastSeenAt, most recent first
        const sortedSlaveDevices = [...slaveDevices].sort((a, b) => {
          if (!a.lastSeenAt) return 1;
          if (!b.lastSeenAt) return -1;
          return b.lastSeenAt.localeCompare(a.lastSeenAt);
        });

        // Add cameras from most recently seen slaves first
        sortedSlaveDevices.forEach((device) => {
          device.cameras.forEach((camera) => {
            if (!uniqueCameraMap.has(camera.name)) {
              uniqueCameraMap.set(camera.name, {
                ...camera,
                slaveId: device.id,
              });
            }
          });
        });

        const uniqueCameras = Array.from(uniqueCameraMap.values());

        // Update store
        useCameraStore.setState({
          slaveDevices: [...slaveDevices],
          allCameras,
          uniqueCameras,
          lastUpdated: new Date(),
        });
      }
    }
  } catch (error) {
    console.error("Error processing camera change message:", error);
  }
};

// Process configuration message
const processConfigurationMessage = (message: string) => {
  try {
    // Parse as JSON
    const data = JSON.parse(message);

    if (data.c === "changed" && data.data === "configuration.autoscan") {
      // Update auto scan status
      useCameraStore.setState({
        autoScan: data.val === true || data.val === "true" || data.val === 1,
      });
    }
  } catch (error) {
    console.error("Error processing configuration message:", error);
  }
};

// Update slave device property
const updateSlaveDeviceProperty = (
  slaveDevice: SlaveDevice,
  path: string,
  value: any
) => {
  // Debug output
  console.log(`Updating slave property: ${slaveDevice.id}.${path} = ${value}`);

  // Basic properties
  if (path === "connected") {
    slaveDevice.connected = parseInt(value);
  } else if (path === "ipv4") {
    slaveDevice.ipv4 = value;
  } else if (path === "ipv6") {
    slaveDevice.ipv6 = value;
  } else if (path === "last_seen_at") {
    slaveDevice.lastSeenAt = value;
  } else if (path === "test.uptime") {
    slaveDevice.uptime = value;
  } else if (path === "test.is_error") {
    slaveDevice.isError = parseInt(value);
  } else if (path === "test.finished") {
    slaveDevice.testFinished = parseInt(value);
  } else if (path === "test.finished_at") {
    slaveDevice.testFinishedAt = value;
  }
  // Update camera information
  else if (path.startsWith("cam[")) {
    const regex = /cam\[(\d+)\]\.(.+)/;
    const match = path.match(regex);

    if (match && match.length === 3) {
      const cameraIndex = parseInt(match[1]);
      const cameraProperty = match[2];

      // Expand camera list if not big enough
      while (slaveDevice.cameras.length <= cameraIndex) {
        slaveDevice.cameras.push({
          name: `Camera ${cameraIndex + 1}`,
          cameraIp: "",
          username: "",
          password: "",
          mediaUri: "",
          subUri: "",
          recordUri: "",
          mainSnapShot: "",
          subSnapShot: "",
          status: true, // Show as connected by default
        });
      }

      // Update camera property
      const camera = slaveDevice.cameras[cameraIndex];

      switch (cameraProperty) {
        case "name":
          camera.name = value;
          break;
        case "cameraIp":
          camera.cameraIp = value;
          break;
        case "username":
          camera.username = value;
          break;
        case "password":
          camera.password = value;
          break;
        case "mediaUri":
          camera.mediaUri = value;
          break;
        case "subUri":
          camera.subUri = value;
          break;
        case "recordUri":
          camera.recordUri = value;
          break;
        case "mainSnapShot":
          camera.mainSnapShot = value;
          break;
        case "subSnapShot":
          camera.subSnapShot = value;
          break;
        case "soundRec":
          camera.soundRec = value === true || value === "true";
          break;
        case "recordcodec":
          camera.recordcodec = value;
          break;
        case "recordwidth":
          camera.recordwidth = parseInt(value);
          break;
        case "recordheight":
          camera.recordheight = parseInt(value);
          break;
        case "subcodec":
          camera.subcodec = value;
          break;
        case "subwidth":
          camera.subwidth = parseInt(value);
          break;
        case "subheight":
          camera.subheight = parseInt(value);
          break;
      }
    }
  }
};

export default useCameraStore;
