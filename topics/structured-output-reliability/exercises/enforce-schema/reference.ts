export interface Field {
  key: string;
  type: "string" | "number" | "boolean";
  required: boolean;
  enum?: string[];
}

export function enforce(obj: Record<string, unknown>, schema: Field[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const field of schema) {
    const present = Object.prototype.hasOwnProperty.call(obj, field.key);
    if (!present) {
      if (field.required) errors.push(`${field.key}: missing`);
      continue;
    }
    const value = obj[field.key];
    if (typeof value !== field.type) {
      errors.push(`${field.key}: expected ${field.type}`);
      continue;
    }
    if (field.enum && !field.enum.includes(value as string)) {
      errors.push(`${field.key}: not in enum`);
    }
  }
  return { valid: errors.length === 0, errors };
}
