import { useEffect, useState } from "react";
import {
  RefreshCw,
  Clock,
  Thermometer,
  HardDrive,
  MemoryStickIcon as Memory,
  Wifi,
  Zap,
  Battery,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import useSystemStore from "@/store/systemStore";

const Dashboard = () => {
  const {
    rawSystemData,
    isLoading,
    error,
    lastUpdated,
    fetchSystemInfo,
    startMonitoring,
    stopMonitoring,
  } = useSystemStore();

  const [showRawData, setShowRawData] = useState(false);

  useEffect(() => {
    startMonitoring();

    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  useEffect(() => {
    if (error) {
      toast.error(`System data error: ${error}`);
    }
  }, [error]);

  const formatDate = (date: Date | null) => {
    if (!date) return "Henüz güncellenmedi";
    return date.toLocaleString();
  };

  const handleRefresh = () => {
    toast.info("Refreshing system info...");
    fetchSystemInfo();
  };

  const formatJSON = (data: any) => {
    if (!data) return "No data";
    return JSON.stringify(data, null, 2);
  };

  const formatUptime = (uptime: string | undefined) => {
    if (!uptime) return "N/A";

    const seconds = parseInt(uptime, 10);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days} gün ${hours} saat`;
    } else if (hours > 0) {
      return `${hours} saat ${minutes} dakika`;
    } else {
      return `${minutes} dakika`;
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 60) return "text-green-500";
    if (temp < 80) return "text-yellow-500";
    return "text-red-500";
  };

  const calculateMemoryUsage = () => {
    if (!rawSystemData) return { used: 0, total: 0, percentage: 0 };

    const totalRam = parseInt(rawSystemData.totalRam || "0", 10);
    const freeRam = parseInt(rawSystemData.freeRam || "0", 10);
    const usedRam = totalRam - freeRam;
    const percentage = totalRam ? Math.round((usedRam / totalRam) * 100) : 0;

    // GB cinsinden değerleri hesapla
    const totalGB = Math.round(totalRam / (1024 * 1024 * 1024));
    const usedGB = Math.round(usedRam / (1024 * 1024 * 1024));

    return {
      used: usedGB,
      total: totalGB,
      percentage,
    };
  };

  const memoryUsage = calculateMemoryUsage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Status</h1>
          <p className="text-muted-foreground">
            Device system information and status
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
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>{isLoading ? "Yenileniyor..." : "Refresh"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowRawData(!showRawData)}
          >
            <span>{showRawData ? "Hide data" : "Show raw data"}</span>
          </Button>
        </div>
      </div>

      {showRawData && (
        <Card>
          <CardHeader>
            <CardTitle>Raw System Data</CardTitle>
            <CardDescription>
              Unprocessed camera data from WebSocket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-80 text-xs">
              {formatJSON(rawSystemData)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="status">
        <TabsList>
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="info">System Info</TabsTrigger>
        </TabsList>
        <TabsContent value="status" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Temperature
                </CardTitle>
                <Thermometer
                  className={`h-4 w-4 ${
                    rawSystemData?.cpuTemp
                      ? getTemperatureColor(parseFloat(rawSystemData.cpuTemp))
                      : "text-muted-foreground"
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    rawSystemData?.cpuTemp
                      ? getTemperatureColor(parseFloat(rawSystemData.cpuTemp))
                      : "text-muted-foreground"
                  }`}
                >
                  {rawSystemData?.cpuTemp || "0.00"}°C
                </div>
                <p className="text-xs text-muted-foreground">
                  {parseFloat(rawSystemData?.cpuTemp || "0") < 60
                    ? "Normal operating temperature"
                    : parseFloat(rawSystemData?.cpuTemp || "0") < 80
                    ? "High temperature warning"
                    : "Critical temperature alert"}
                </p>
                <Progress
                  value={parseFloat(rawSystemData?.cpuTemp || "0")}
                  max={100}
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Disk Usage
                </CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {/* Bu veri şu an için sabit değer, gerçek veri ile değiştirilmeli */}
                  115/123 GB
                </div>
                <p className="text-xs text-muted-foreground">93% used</p>
                <Progress value={93} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Memory</CardTitle>
                <Memory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {memoryUsage.used}/{memoryUsage.total} GB
                </div>
                <p className="text-xs text-muted-foreground">
                  {memoryUsage.percentage}% used
                </p>
                <Progress value={memoryUsage.percentage} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatUptime(rawSystemData?.upTime)}
                </div>
                <p className="text-xs text-muted-foreground">
                  System running time
                </p>
                <Progress value={100} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>
                  Device system details and network information
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Version
                    </p>
                    <p>{rawSystemData?.version || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      System Time
                    </p>
                    <p>{rawSystemData?.srvTime || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      IP Address
                    </p>
                    <p>{rawSystemData?.eth0 || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Cable IP
                    </p>
                    <p>{rawSystemData?.eth0 || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      GSM IP
                    </p>
                    <p className="text-muted-foreground">
                      {rawSystemData?.ppp0 || "None"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Disk Status
                    </p>
                    <p className="text-green-500">Working</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connection Status</CardTitle>
                <CardDescription>
                  Network and power connection status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    <span>WiFi</span>
                  </div>
                  <div className="h-2 w-16 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    <span>Power</span>
                  </div>
                  <div className="h-2 w-16 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Battery className="h-5 w-5" />
                    <span>Battery</span>
                  </div>
                  <div className="h-2 w-16 rounded-full bg-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="info" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed System Information</CardTitle>
              <CardDescription>
                Complete system specifications and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-semibold">Hardware Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processor</span>
                      <span>ARM Cortex-A53</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Memory</span>
                      <span>{memoryUsage.total}GB DDR4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Storage</span>
                      <span>128GB eMMC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        CPU Temperature
                      </span>
                      <span>{rawSystemData?.cpuTemp || "N/A"}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        GPU Temperature
                      </span>
                      <span>
                        {rawSystemData?.thermal?.["gpu-thermal"] || "N/A"}°C
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Network Configuration</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IP Address</span>
                      <span>{rawSystemData?.eth0 || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Active Connections
                      </span>
                      <span>{rawSystemData?.totalconns || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Active Sessions
                      </span>
                      <span>{rawSystemData?.sessions || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        GPS Coordinates
                      </span>
                      <span>
                        {rawSystemData?.gps?.lat && rawSystemData?.gps?.lon
                          ? `${rawSystemData.gps.lat}, ${rawSystemData.gps.lon}`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GPS Speed</span>
                      <span>{rawSystemData?.gps?.speed || "N/A"} km/h</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
