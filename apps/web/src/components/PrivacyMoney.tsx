"use client";

import React from "react";
import { MoneyDisplay, type MoneyDisplayProps } from "@finai/ui";
import { usePrivacyMode } from "@/hooks";

export interface PrivacyMoneyProps extends MoneyDisplayProps {
  /** If specified, overrides the global privacy mode setting */
  masked?: boolean;
}

export function PrivacyMoney({ masked, ...props }: PrivacyMoneyProps) {
  const { isPrivacyMode } = usePrivacyMode();
  const shouldMask = masked !== undefined ? masked : isPrivacyMode;

  return <MoneyDisplay {...props} masked={shouldMask} />;
}
