import type { Meta, StoryObj } from "@storybook/react";
import { ActivityTimeline } from "./ActivityTimeline";
import type { AgentActivity } from "../api/agentTypes";

const sampleActivities: AgentActivity[] = [
  {
    tool: "load_context",
    kind: "phase",
    status: "success",
    label: "Loaded user financial profile & recent budgets",
    startedAt: 1000,
    completedAt: 1400,
  },
  {
    tool: "get_transactions",
    kind: "tool",
    status: "success",
    label: "Fetched May 2025 transactions (42 items)",
    summary: "Retrieved 42 transactions totaling ₹58,400",
    startedAt: 1500,
    completedAt: 2100,
  },
  {
    tool: "categorize_spend",
    kind: "tool",
    status: "running",
    label: "Analyzing recurring expense anomalies",
    startedAt: 2200,
  },
];

/**
 * `ActivityTimeline` renders the real-time autonomous execution steps of the FinAI Advisor,
 * including tool calls, execution durations, log streaming, and error summaries.
 */
const meta: Meta<typeof ActivityTimeline> = {
  title: "AI Advisor / ActivityTimeline",
  component: ActivityTimeline,
  tags: ["autodocs"],
  args: {
    activities: sampleActivities,
    isStreaming: true,
    hasText: false,
  },
  argTypes: {
    isStreaming: { control: "boolean" },
    hasText: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityTimeline>;

/** Streaming active run with running step and spinner. */
export const ActiveRunning: Story = {};

/** Fully completed run with total execution stats. */
export const CompletedRun: Story = {
  args: {
    isStreaming: false,
    hasText: true,
    activities: [
      {
        tool: "load_context",
        kind: "phase",
        status: "success",
        label: "Loaded financial portfolio",
        startedAt: 1000,
        completedAt: 1200,
      },
      {
        tool: "calculate_health_score",
        kind: "tool",
        status: "success",
        label: "Calculated 6-pillar financial health score",
        summary: "Score computed: 82/100 (Strong)",
        startedAt: 1300,
        completedAt: 1900,
      },
      {
        tool: "generate_insight",
        kind: "phase",
        status: "success",
        label: "Formulated tax optimization recommendations",
        startedAt: 2000,
        completedAt: 2500,
      },
    ],
  },
};

/** Run encountering an error during execution. */
export const ErrorState: Story = {
  args: {
    isStreaming: false,
    activities: [
      {
        tool: "connect_bank_feed",
        kind: "tool",
        status: "error",
        label: "Failed to connect to Bank Account Aggregator",
        detail: "Session expired or consent revoked by user",
        startedAt: 1000,
        completedAt: 3200,
      },
    ],
  },
};
