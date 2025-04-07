import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Records = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Records</h1>
          <p className="text-muted-foreground">
            Camera recordings and archives
          </p>
        </div>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input type="text" placeholder="Search records..." />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Camera Recordings</CardTitle>
          <CardDescription>Browse and manage camera recordings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-3 gap-4 p-4 font-medium border-b">
              <div>Camera</div>
              <div>Date</div>
              <div className="text-right">Actions</div>
            </div>
            <div className="divide-y">
              <div className="grid grid-cols-3 gap-4 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  KAMERA33
                </div>
                <div>2025-04-04</div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  KAMERA30
                </div>
                <div>2025-04-04</div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  KAMERA35
                </div>
                <div>2025-04-04</div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  KAMERA32
                </div>
                <div>2025-04-04</div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  KAMERA40
                </div>
                <div>2025-04-04</div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  KAMERA9
                </div>
                <div>2025-04-04</div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  KAMERA8
                </div>
                <div>2025-04-04</div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm">
                    View
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

export default Records;
