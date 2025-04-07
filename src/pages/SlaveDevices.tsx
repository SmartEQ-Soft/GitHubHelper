import { RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const SlaveDevices = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Slave Devices</h1>
          <p className="text-muted-foreground">
            Connected device status and controls
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Device Controls</CardTitle>
            <CardDescription>
              Toggle device components and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="contact" className="font-medium">
                  Contact
                </Label>
                <Switch id="contact" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="battery" className="font-medium">
                  Battery
                </Label>
                <Switch id="battery" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="camera-sharing" className="font-medium">
                  Camera Sharing
                </Label>
                <Switch id="camera-sharing" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="all-leds" className="font-medium">
                  All LEDs
                </Label>
                <Switch id="all-leds" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Summary</CardTitle>
            <CardDescription>
              Current system status and statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Master ECS Time
                </p>
                <p>2025-04-04 - 14:50:34</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Slave Count
                </p>
                <p>5</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Shared Cameras
                </p>
                <p>1</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Cameras
                </p>
                <p>9</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button className="w-full">
              Camera Management
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="test-periods">
        <TabsList>
          <TabsTrigger value="test-periods">Test Periods</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>
        <TabsContent value="test-periods" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Periods</CardTitle>
              <CardDescription>
                Device test periods and intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-sm font-medium">
                  <div>Type</div>
                  <div>Period (min)</div>
                  <div>Total Time</div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div>Contact Test</div>
                    <div>
                      <Progress value={60} max={240} className="h-2.5" />
                      <div className="mt-1 text-xs">60 min</div>
                    </div>
                    <div>672 hours</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div>Battery Test</div>
                    <div>
                      <Progress value={240} max={240} className="h-2.5" />
                      <div className="mt-1 text-xs">240 min</div>
                    </div>
                    <div>168 hours</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div>Wi-Fi Control</div>
                    <div>
                      <Progress value={120} max={240} className="h-2.5" />
                      <div className="mt-1 text-xs">120 min</div>
                    </div>
                    <div>168 hours</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div>Total Test</div>
                    <div className="col-span-2">48 hours</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
              <CardDescription>
                List of all connected slave devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                  <div>Device ID</div>
                  <div>IP Address</div>
                  <div>Status</div>
                  <div>Last Seen</div>
                </div>
                <div className="divide-y">
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div>Slave001</div>
                    <div>192.168.1.101</div>
                    <div className="text-green-500">Online</div>
                    <div>Just now</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div>Slave002</div>
                    <div>192.168.1.102</div>
                    <div className="text-green-500">Online</div>
                    <div>2 min ago</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div>Slave003</div>
                    <div>192.168.1.103</div>
                    <div className="text-green-500">Online</div>
                    <div>5 min ago</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div>Slave004</div>
                    <div>192.168.1.104</div>
                    <div className="text-green-500">Online</div>
                    <div>7 min ago</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div>Slave005</div>
                    <div>192.168.1.105</div>
                    <div className="text-green-500">Online</div>
                    <div>10 min ago</div>
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

export default SlaveDevices;
