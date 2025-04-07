import { useEffect, useState } from "react";
import { RefreshCw, Plus, Camera as CameraIcon, AlertCircle, CheckCircle2, Code, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import useCameraStore from "@/store/cameraStore";
import wsManager from "@/lib/websocket";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Cameras = () => {
  const { 
    allCameras, 
    slaveDevices,
    uniqueCameras,
    isLoading, 
    error, 
    lastUpdated, 
    autoScan,
    fetchCameras, 
    startMonitoringCameras, 
    stopMonitoringCameras,
    setAutoScan
  } = useCameraStore();

  const [showRawData, setShowRawData] = useState(false);
  const [selectedSlave, setSelectedSlave] = useState<string>("all");
  const [displayedCameras, setDisplayedCameras] = useState<typeof uniqueCameras>([]);

  // Filter cameras based on selected slave
  useEffect(() => {
    if (selectedSlave === "all") {
      setDisplayedCameras(uniqueCameras);
    } else if (selectedSlave === "unique") {
      setDisplayedCameras(uniqueCameras);
    } else {
      const slave = slaveDevices.find(s => s.id === selectedSlave);
      setDisplayedCameras(slave ? slave.cameras : []);
    }
  }, [selectedSlave, uniqueCameras, slaveDevices]);

  // Fetch camera info when component mounts
  useEffect(() => {
    // Start camera monitoring
    startMonitoringCameras();
    
    // Stop monitoring when component unmounts
    return () => {
      stopMonitoringCameras();
    };
  }, [startMonitoringCameras, stopMonitoringCameras]);

  // Watch for errors
  useEffect(() => {
    if (error) {
      toast.error(`Camera information error: ${error}`);
    }
  }, [error]);

  // Refresh cameras
  const handleRefresh = () => {
    toast.info("Refreshing camera information...");
    fetchCameras();
  };

  // Take snapshot
  const handleTakeSnapshot = (cameraName: string) => {
    toast.info(`Taking snapshot for ${cameraName}...`);
    
    const success = wsManager.sendMessage(`DO TAKESNAPSHOT "${cameraName}"`);
    
    if (!success) {
      toast.error("Failed to take snapshot");
    }
  };

  // Scan for cameras
  const handleScanCameras = () => {
    toast.info("Scanning for cameras...");
    
    // Camera scanning command
    wsManager.sendMessage("DO SCRIPT scan_cameras");
  };

  // Change auto scan setting
  const handleAutoScanChange = (checked: boolean) => {
    setAutoScan(checked);
    toast.success(`Automatic camera scanning ${checked ? 'enabled' : 'disabled'}`);
  };

  // Change audio recording setting
  const handleAudioRecordChange = (checked: boolean) => {
    toast.success(`Camera audio recording ${checked ? 'enabled' : 'disabled'}`);
    
    // Here you can send the command to set audio recording
    // wsManager.sendMessage(`DO SETBOOL something.audio ${checked}`);
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return "Not updated yet";
    return date.toLocaleString();
  };

  // Format JSON data
  const formatJSON = (data: any) => {
    if (!data) return "No data";
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cameras</h1>
          <p className="text-muted-foreground">
            Camera views and controls
            {lastUpdated && (
              <span className="ml-2 text-xs">
                Last updated: {formatDate(lastUpdated)}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowRawData(!showRawData)}
          >
            <Code className="h-4 w-4" />
            <span>{showRawData ? "Hide Raw Data" : "Show Raw Data"}</span>
          </Button>
          <Button 
            size="sm" 
            className="gap-1"
            onClick={handleScanCameras}
          >
            <Plus className="h-4 w-4" />
            <span>Search Cameras</span>
          </Button>
        </div>
      </div>
      
      {/* Raw data display */}
      {showRawData && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Camera Data</CardTitle>
            <CardDescription>Unprocessed camera data from WebSocket</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Slave Devices:</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60 text-xs">
                  {formatJSON(slaveDevices)}
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">All Cameras:</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60 text-xs">
                  {formatJSON(allCameras)}
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Unique Cameras:</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60 text-xs">
                  {formatJSON(uniqueCameras)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Camera Settings</CardTitle>
            <CardDescription>Configure camera behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-scan" className="font-medium">
                Automatic Camera Scanning
              </Label>
              <Switch 
                id="auto-scan" 
                checked={autoScan}
                onCheckedChange={handleAutoScanChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="audio-record" className="font-medium">
                Camera Audio Recording
              </Label>
              <Switch 
                id="audio-record" 
                defaultChecked
                onCheckedChange={handleAudioRecordChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Camera Filters</CardTitle>
            <CardDescription>Filter cameras by slave device</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Label htmlFor="slave-select" className="whitespace-nowrap">Filter By Device:</Label>
              <Select 
                value={selectedSlave} 
                onValueChange={setSelectedSlave}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select slave device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>View Options</SelectLabel>
                    <SelectItem value="all">All Cameras</SelectItem>
                    <SelectItem value="unique">Unique Cameras</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Slave Devices</SelectLabel>
                    {slaveDevices.map(slave => (
                      <SelectItem key={slave.id} value={slave.id}>
                        {slave.id.replace(/_/g, ':')} ({slave.cameras.length})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {displayedCameras.length} cameras
                {selectedSlave !== "all" && selectedSlave !== "unique" && (
                  <span> from device {selectedSlave.replace(/_/g, ':')}</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slave devices summary */}
      {slaveDevices.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Connected Slave Devices</CardTitle>
              <CardDescription>Status of slave devices in the system</CardDescription>
            </div>
            <Badge variant="outline">{slaveDevices.length} Devices</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slaveDevices.map(device => (
                <div key={device.id} 
                  className={`flex items-center justify-between border-b pb-2 ${
                    selectedSlave === device.id ? 'bg-accent/30 rounded p-2 -mx-2' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium">{device.id.replace(/_/g, ':')}</p>
                    <p className="text-sm text-muted-foreground">IP: {device.ipv4}</p>
                    <p className="text-xs text-muted-foreground">Cameras: {device.cameras.length}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`px-2 py-1 rounded-md text-xs ${device.connected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {device.connected ? 'Connected' : 'Disconnected'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last seen: {device.lastSeenAt}
                    </p>
                    {device.uptime && (
                      <p className="text-xs text-muted-foreground">
                        Uptime: {device.uptime}
                      </p>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-xs h-6 mt-1"
                      onClick={() => setSelectedSlave(device.id)}
                    >
                      View Cameras
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No cameras message */}
      {displayedCameras.length === 0 && !isLoading && (
        <Card className="p-8 flex flex-col items-center justify-center text-center">
          <CameraIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Cameras Found</h3>
          <p className="text-muted-foreground mb-4">
            No cameras were found or the cameras haven't loaded yet.
          </p>
          <Button onClick={handleScanCameras}>Search Cameras</Button>
        </Card>
      )}

      {/* Camera list */}
      <div className="grid gap-6 md:grid-cols-2">
        {displayedCameras.map((camera, index) => (
          <Card key={`${camera.name}-${index}`} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{camera.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-500 text-white hover:bg-green-600"
                >
                  Connected
                </Button>
              </div>
              <CardDescription className="text-xs">
                {camera.cameraIp} {camera.mediaUri && camera.mediaUri}
              </CardDescription>
              {camera.slaveId && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Device: {camera.slaveId.replace(/_/g, ':')}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black relative flex items-center justify-center text-white">
                {camera.mainSnapShot ? (
                  <img 
                    src={camera.mainSnapShot} 
                    alt={camera.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="text-center">
                    <p>CAMERA FEED</p>
                    <p className="text-sm text-gray-400">{new Date().toLocaleString()}</p>
                  </div>
                )}
                
                {/* Camera control buttons */}
                <div className="absolute bottom-2 right-2 flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleTakeSnapshot(camera.name)}
                  >
                    Take Snapshot
                  </Button>
                </div>
              </div>
              
              {/* Camera details */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Resolution:</span>
                  <span>{camera.recordwidth}x{camera.recordheight}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Codec:</span>
                  <span>{camera.recordcodec}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Audio:</span>
                  <span>{camera.soundRec ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-red-500" />}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Sub-Resolution:</span>
                  <span>{camera.subwidth}x{camera.subheight}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Cameras;