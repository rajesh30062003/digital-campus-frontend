import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { institutionApi, IInstitutionConfig } from "@/lib/api";
import { useEffect } from "react";

// Helper to convert hex to HSL format used by Tailwind variables
function hexToHsl(hex: string): string {
  if (!hex || !/^#[0-9A-F]{6}$/i.test(hex)) {
    return "142 58% 33%"; // Default emerald fallback
  }
  
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function useInstitution() {
  const queryClient = useQueryClient();

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ["institution-config"],
    queryFn: institutionApi.getConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const config: IInstitutionConfig | undefined = responseData?.data;

  // Dynamically inject CSS variables when the colors change
  useEffect(() => {
    if (config) {
      const primaryHsl = hexToHsl(config.primaryColor || "#6d28d9");
      const secondaryHsl = hexToHsl(config.secondaryColor || "#4f46e5");
      
      document.documentElement.style.setProperty("--primary", primaryHsl);
      document.documentElement.style.setProperty("--ring", primaryHsl);
      document.documentElement.style.setProperty("--chart-1", primaryHsl);
      document.documentElement.style.setProperty("--sidebar-primary", primaryHsl);
      document.documentElement.style.setProperty("--sidebar-ring", primaryHsl);

      document.documentElement.style.setProperty("--secondary", secondaryHsl);
      document.documentElement.style.setProperty("--chart-2", secondaryHsl);
      document.documentElement.style.setProperty("--sidebar-accent", secondaryHsl);
    }
  }, [config?.primaryColor, config?.secondaryColor, config]);

  const updateMutation = useMutation({
    mutationFn: (newConfig: Partial<IInstitutionConfig>) => institutionApi.updateConfig(newConfig),
    onSuccess: (data) => {
      queryClient.setQueryData(["institution-config"], data);
      queryClient.invalidateQueries({ queryKey: ["institution-config"] });
    },
  });

  const isModuleEnabled = (moduleName: string): boolean => {
    if (!config) return true; // Default to all modules enabled if config isn't loaded yet
    
    // Normalize string comparisons to make checks highly robust
    const name = moduleName.toLowerCase().trim();
    
    // Check modules list
    return config.enabledModules.some(
      (m: string) => m.toLowerCase().trim() === name || m.toLowerCase().trim() === name.replace("-", "")
    );
  };

  return {
    config,
    isLoading,
    error,
    updateConfig: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isModuleEnabled,
    institutionType: config?.institutionType || "Medical College"
  };
}
