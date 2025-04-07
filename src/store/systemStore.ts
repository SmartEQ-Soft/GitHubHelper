// src/store/systemStore.ts

import { create } from "zustand";
import wsManager from "@/lib/websocket";

// Store durumu
interface SystemState {
  // Veri durumları
  rawSystemData: any;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Eylemler
  fetchSystemInfo: () => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearError: () => void;
}

// Sistem store'u oluştur
const useSystemStore = create<SystemState>((set, get) => ({
  rawSystemData: null,
  isLoading: false,
  error: null,
  lastUpdated: null,

  // Sistem bilgilerini getir
  fetchSystemInfo: () => {
    set({ isLoading: true, error: null });

    try {
      // WebSocket bağlantısını kontrol et
      if (wsManager.getStatus() !== "open") {
        set({
          isLoading: false,
          error: "WebSocket bağlantısı yok, lütfen tekrar giriş yapın",
        });
        return;
      }

      // DO MONITOR system komutu gönder
      const success = wsManager.sendMessage("DO MONITOR system");

      if (!success) {
        set({
          isLoading: false,
          error: "Sistem bilgisi isteği gönderilemedi",
        });
        return;
      }

      set({ isLoading: false });
    } catch (error) {
      console.error("Sistem bilgisi alma hatası:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu",
      });
    }
  },

  // Sistem izlemeyi başlat
  startMonitoring: () => {
    try {
      // WebSocket bağlantısını kontrol et
      if (wsManager.getStatus() !== "open") {
        set({
          error: "WebSocket bağlantısı yok, lütfen tekrar giriş yapın",
        });
        return;
      }

      // Önceki dinleyiciyi kaldır
      wsManager.removeMessageListener(handleSystemMessage);

      // Yeni dinleyici ekle
      wsManager.addMessageListener(handleSystemMessage);

      // DO MONITOR system komutu gönder
      const success = wsManager.sendMessage("DO MONITOR system");

      console.log("DO MONITOR system gönderildi, başarılı:", success);

      if (!success) {
        set({
          error: "Sistem izleme başlatılamadı",
        });
      }
    } catch (error) {
      console.error("Sistem izleme başlatma hatası:", error);
      set({
        error:
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu",
      });
    }
  },

  // Sistem izlemeyi durdur
  stopMonitoring: () => {
    wsManager.removeMessageListener(handleSystemMessage);
  },

  // Hatayı temizle
  clearError: () => set({ error: null }),
}));

// Sistem mesajlarını işleyen fonksiyon
const handleSystemMessage = (message: string) => {
  try {
    // JSON olarak ayrıştırmayı dene
    try {
      const parsedData = JSON.parse(message);
      console.log("JSON mesajı alındı:", parsedData);

      // "sysinfo" tipinde mesaj kontrolü
      if (parsedData.c === "sysinfo") {
        // Ham veriyi sakla
        useSystemStore.setState({
          rawSystemData: parsedData,
          lastUpdated: new Date(),
        });
      }
    } catch (e) {
      console.log("JSON ayrıştırma hatası, ham mesaj:", message);
    }
  } catch (error) {
    console.error("Sistem mesajı işleme hatası:", error);
  }
};

export default useSystemStore;
