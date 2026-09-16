import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiController } from "./ai.controller";
import { AiModelService } from "./ai-model.service";
import { OllamaService } from "./ollama.service";
import { ContextBuilderService } from "./context-builder.service";
import { ConversationService } from "./conversation.service";
import { TransactionsModule } from "@/modules/transactions/transactions.module";

@Module({
  imports: [ConfigModule, TransactionsModule],
  controllers: [AiController],
  providers: [AiModelService, OllamaService, ContextBuilderService, ConversationService],
  exports: [AiModelService, OllamaService, ContextBuilderService, ConversationService],
})
export class AiModule {}
