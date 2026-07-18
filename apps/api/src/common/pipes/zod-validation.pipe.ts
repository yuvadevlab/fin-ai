import { PipeTransform, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import type { ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== "body") {
      return value;
    }
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const errorMsg = result.error.errors
        .map((error) => `${error.path.join(".")}: ${error.message}`)
        .join(", ");
      throw new BadRequestException(`Validation failed: ${errorMsg}`);
    }
    return result.data;
  }
}
