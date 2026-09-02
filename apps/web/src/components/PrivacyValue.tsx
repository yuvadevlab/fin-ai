"use client";

import React from "react";
import { MaskedValue, type MaskedValueProps } from "@finai/ui";
import { usePrivacyMode } from "@/hooks";

export interface PrivacyValueProps extends MaskedValueProps {
  /** If specified, overrides the global privacy mode setting */
  masked?: boolean;
}

export function PrivacyValue({ masked, ...props }: PrivacyValueProps) {
  const { isPrivacyMode } = usePrivacyMode();
  const shouldMask = masked !== undefined ? masked : isPrivacyMode;

  return <MaskedValue {...props} masked={shouldMask} />;
}
