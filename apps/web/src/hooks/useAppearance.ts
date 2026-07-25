import { useContext } from "react";
import {
  AppearanceContext,
  type AppearanceContextValue,
} from "@/providers/appearance/AppearanceProvider";

export function useAppearance(): AppearanceContextValue {
  return useContext(AppearanceContext);
}
