import { useAppearance } from "./useAppearance";

export function usePrivacyMode() {
  const { isPrivacyMode, togglePrivacyMode, apply } = useAppearance();

  const setPrivacyMode = (enabled: boolean) => {
    apply({ privacyMode: enabled });
  };

  return {
    isPrivacyMode,
    togglePrivacyMode,
    setPrivacyMode,
  };
}
