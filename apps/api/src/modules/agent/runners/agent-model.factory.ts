import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OllamaChatModel, type ChatModel } from "@finai/ai-engine";

/** Creates a fresh Ollama model client per agent run. */
@Injectable()
export class AgentModelFactory {
  private readonly logger = new Logger(AgentModelFactory.name);

  constructor(private readonly configService: ConfigService) {}

  create(): ChatModel {
    return new OllamaChatModel({
      baseUrl: this.configService.get<string>("OLLAMA_BASE_URL", "http://localhost:11434"),
      model: this.configService.get<string>("OLLAMA_MODEL", "gemma4:31b-cloud"),
    });
  }
}
