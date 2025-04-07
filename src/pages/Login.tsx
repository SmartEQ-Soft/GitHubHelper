// src/pages/Login.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuthStore from "@/store/authStore";
import wsManager, {
  WS_STATUS,
  WebSocketStatus,
} from "@/lib/websocket";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [socketStatus, setSocketStatus] = useState<WebSocketStatus>(
    wsManager.getStatus()
  );

  const navigate = useNavigate();

  // Auth store'dan durumları ve fonksiyonları al
  const { isLoggedIn, isLoggingIn, loginError, login, clearError } =
    useAuthStore();

  // Eğer zaten giriş yapılmışsa ana sayfaya yönlendir
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  // WebSocket durumunu takip et
  useEffect(() => {
    const handleStatusChange = (status: WebSocketStatus) => {
      setSocketStatus(status);

      // WebSocket bağlantı durumu değiştiğinde bildirim göster
      if (status === WS_STATUS.OPEN) {
        toast.success("Sunucu bağlantısı kuruldu");
      } else if (status === WS_STATUS.ERROR) {
        toast.error("Sunucu bağlantı hatası");
      } else if (
        status === WS_STATUS.CLOSED &&
        socketStatus === WS_STATUS.OPEN
      ) {
        toast.warning("Sunucu bağlantısı kesildi");
      }
    };

    // Status listener ekle
    wsManager.addStatusListener(handleStatusChange);

    // Component unmount olduğunda dinleyiciyi kaldır
    return () => {
      wsManager.removeStatusListener(handleStatusChange);
    };
  }, [socketStatus]);

  // Login error değiştiğinde toast göster
  useEffect(() => {
    if (loginError) {
      toast.error(`Giriş hatası: ${loginError}`);
      clearError();
    }
  }, [loginError, clearError]);

  // WebSocket durumunu okunabilir formata dönüştür
  const getStatusText = (): string => {
    switch (socketStatus) {
      case WS_STATUS.CONNECTING:
        return "Bağlanıyor...";
      case WS_STATUS.OPEN:
        return "Bağlı";
      case WS_STATUS.CLOSING:
        return "Bağlantı kesiliyor...";
      case WS_STATUS.CLOSED:
        return "Bağlantı kesildi";
      case WS_STATUS.ERROR:
        return "Bağlantı hatası";
      default:
        return "Bilinmeyen durum";
    }
  };

  // Bağlan butonuna tıklandığında
  const handleConnect = async () => {
    try {
      toast.info("Sunucu bağlantısı kuruluyor...");
      await wsManager.connect();
    } catch (error) {
      let errorMessage = "Bağlantı hatası";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  // Form gönderildiğinde
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Kullanıcı adı ve şifre gereklidir");
      return;
    }

    // Giriş işlemini gerçekleştir
    try {
      // WebSocket bağlantısını kontrol et
      if (socketStatus !== WS_STATUS.OPEN) {
        toast.info("Sunucu bağlantısı kuruluyor...");
        await wsManager.connect();
      }

      // Giriş yap
      const success = await login(username, password);

      if (success) {
        // Giriş başarılı, yönlendir
        toast.success("Giriş başarılı");
        navigate("/");
      }
    } catch (error) {
      let errorMessage = "Bir hata oluştu";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  const isSocketConnected = socketStatus === WS_STATUS.OPEN;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white">
            <span className="text-xl font-bold">M</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold">Movita</h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Hoş Geldiniz</CardTitle>
            <CardDescription>Cihaz İzleme Sistemi</CardDescription>
            <div
              className={`text-sm mt-2 ${
                isSocketConnected ? "text-green-500" : "text-red-500"
              }`}
            >
              Sunucu bağlantısı: {getStatusText()}
              {!isSocketConnected && socketStatus !== WS_STATUS.CONNECTING && (
                <Button
                  variant="link"
                  className="px-2 py-0 h-auto text-xs"
                  onClick={handleConnect}
                  disabled={isLoggingIn}
                >
                  Bağlan
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Kullanıcı Adı</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={isLoggingIn}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Şifre</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoggingIn}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoggingIn || !isSocketConnected}
                  >
                    {isLoggingIn ? "Giriş yapılıyor..." : "Giriş Yap"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Movita. Tüm hakları saklıdır.</p>
          <p>Versiyon 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
