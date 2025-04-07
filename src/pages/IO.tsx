import { Plus, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const IO = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">I/O Controls</h1>
          <p className="text-muted-foreground">Input/Output controllers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            <span>Add I/O</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>I/O Controllers</CardTitle>
          <CardDescription>Manage input and output pins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
              <div>I/O Name</div>
              <div>Pin</div>
              <div>Type</div>
              <div>Value</div>
            </div>
            <div className="divide-y">
              <div className="grid grid-cols-4 gap-4 p-4">
                <div>camReg</div>
                <div>23</div>
                <div>
                  <Badge variant="outline">output</Badge>
                </div>
                <div>
                  <Badge className="bg-black text-white">1</Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-4">
                <div>networkReg</div>
                <div>19</div>
                <div>
                  <Badge variant="outline">output</Badge>
                </div>
                <div>
                  <Badge className="bg-black text-white">1</Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-4">
                <div>simLed</div>
                <div>6</div>
                <div>
                  <Badge variant="outline">output</Badge>
                </div>
                <div>
                  <Badge className="bg-black text-white">0</Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-4">
                <div>kontakLed</div>
                <div>10</div>
                <div>
                  <Badge variant="outline">input</Badge>
                </div>
                <div></div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-4">
                <div>akuLed</div>
                <div>11</div>
                <div>
                  <Badge variant="outline">input</Badge>
                </div>
                <div></div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-4">
                <div>gpsLed</div>
                <div>9</div>
                <div>
                  <Badge variant="outline">output</Badge>
                </div>
                <div>
                  <Badge className="bg-black text-white">0</Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-4">
                <div>kayitLed</div>
                <div>13</div>
                <div>
                  <Badge variant="outline">output</Badge>
                </div>
                <div>
                  <Badge className="bg-black text-white">0</Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-4">
                <div>diskLed</div>
                <div>14</div>
                <div>
                  <Badge variant="outline">output</Badge>
                </div>
                <div>
                  <Badge className="bg-black text-white">1</Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-4">
                <div>panicButton</div>
                <div>25</div>
                <div>
                  <Badge variant="outline">input</Badge>
                </div>
                <div>
                  <Button size="sm" className="bg-red-500 hover:bg-red-600">
                    RESET
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IO;
