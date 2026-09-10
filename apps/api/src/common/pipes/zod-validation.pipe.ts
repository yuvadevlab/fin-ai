import { PipeTransform, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import type { ZodSchema } from "zod";

/**
 * Global validation pipe that runs a Zod schema against the request body.
 *
 * Used via `@Body(new ZodValidationPipe(schema))` on controllers to enforce
 * request-body contracts at the transport layer (before they reach the service).
 * Only validates `body` arguments — params and query are left untouched.
 */
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
