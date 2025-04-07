import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";

export const AutoLoginProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoggedIn, isLoggingIn, checkAndRestoreSession } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn && !isLoggingIn && location.pathname !== "/login") {
      checkAndRestoreSession().then((success) => {
        if (success) {
          toast.success("Oturum otomatik olarak yenilendi");
        } else if (localStorage.getItem("isLoggedIn") === "true") {
          toast.error("Oturum süresi doldu, lütfen tekrar giriş yapın");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("username");
          localStorage.removeItem("password");
        }
      });
    }
  }, [isLoggedIn, isLoggingIn, checkAndRestoreSession, location.pathname]);

  return <>{children}</>;
};

export default AutoLoginProvider;
