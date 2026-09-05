import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiController } from "./ai.controller";
import { OllamaService } from "./ollama.service";
import { ContextBuilderService } from "./context-builder.service";
import { ConversationService } from "./conversation.service";
import { TransactionsModule } from "@/modules/transactions/transactions.module";

@Module({
  imports: [ConfigModule, TransactionsModule],
  controllers: [AiController],
  providers: [OllamaService, ContextBuilderService, ConversationService],
  exports: [OllamaService],
})
export class AiModule {}
