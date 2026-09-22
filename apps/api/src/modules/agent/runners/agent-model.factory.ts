import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { createChatModelFromEnv, type ChatModel, type AiProviderRole } from "@finai/ai-engine";

/** Creates a {@link ChatModel} client per agent run, selected via env vars. */
@Injectable()
export class AgentModelFactory {
  private readonly logger = new Logger(AgentModelFactory.name);

  create(role: AiProviderRole = "agent"): ChatModel {
    // All provider wiring (BASE_URL / API_PATH / keys / models) comes from
    // process.env — ConfigModule loads .env at boot, so new env vars flow
    // through without editing this file. Tests inject via process.env.
    const env: Record<string, string | undefined> = { ...process.env };
    const model = createChatModelFromEnv(env, role);
    this.logger.log(`AI provider [${role}]: ${model.provider} (${model.model})`);
    return model;
  }

  createFastModel(): ChatModel {
    return this.create("chat");
  }

  createAgentModel(): ChatModel {
    return this.create("agent");
  }
}
