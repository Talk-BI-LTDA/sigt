import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { API_CONFIG, LoginRequest, LoginResponse } from "~/lib/api";
import { useAuthStore } from "~/store/auth";

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<LoginResponse> => {
      console.log("Tentando login com:", data);

      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao fazer login");
      }

      const result = await response.json();
      console.log("Login response:", result);

      return result;
    },
    onSuccess: (data) => {
      console.log("Login bem-sucedido:", data);

      // Usar a estrutura correta da resposta
      setAuth(data.user, data.backendTokens, data.driver);
      router.replace("/dashboard");
    },
    onError: (error: any) => {
      console.error("Erro de login:", error.message);
      alert(`Erro no login: ${error.message}`);
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      // Opcionalmente chamar endpoint de logout na API
      const token = useAuthStore.getState().getAccessToken();

      if (token) {
        try {
          await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.warn("Erro ao fazer logout na API:", error);
        }
      }
    },
    onSettled: () => {
      // Sempre limpar dados locais
      logout();
      router.replace("/auth/login");
    },
  });
};
