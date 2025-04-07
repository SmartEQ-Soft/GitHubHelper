import { create } from "zustand";
import wsManager, { WebSocketError } from "@/lib/websocket";

interface AuthState {
  isLoggedIn: boolean;
  username: string;
  loginError: string | null;
  isLoggingIn: boolean;

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  clearError: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  username: "",
  loginError: null,
  isLoggingIn: false,

  login: async (username: string, password: string): Promise<boolean> => {
    set({ isLoggingIn: true, loginError: null });

    try {
      // WebSocket bağlantısını kontrol et
      if (wsManager.getStatus() !== "open") {
        await wsManager.connect();
      }

      // Login komutunu gönder
      const loginSuccess = wsManager.login(username, password);

      if (!loginSuccess) {
        throw new Error("Login komutu gönderilemedi");
      }

      // Basit bir bekleme süresi - gerçek uygulamada yanıt beklemek daha iyi olabilir
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Login başarılı kabul et
      set({
        isLoggedIn: true,
        username,
        isLoggingIn: false,
      });

      return true;
    } catch (error) {
      // Hata mesajını ayarla
      let errorMessage = "Bilinmeyen bir hata oluştu";

      if (error instanceof WebSocketError || error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        isLoggedIn: false,
        isLoggingIn: false,
        loginError: errorMessage,
      });

      console.error("Login hatası:", error);
      return false;
    }
  },

  // Çıkış fonksiyonu
  logout: async (): Promise<boolean> => {
    try {
      // WebSocket üzerinden çıkış
      if (wsManager.getStatus() === "open") {
        wsManager.logout();
      }

      // Store durumunu güncelle
      set({
        isLoggedIn: false,
        username: "",
        loginError: null,
      });

      return true;
    } catch (error) {
      console.error("Çıkış hatası:", error);
      return false;
    }
  },

  // Hata temizleme fonksiyonu
  clearError: () => set({ loginError: null }),
}));

export default useAuthStore;
