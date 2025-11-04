/**
 * Flattens a nested object into dot-notation keys.
 * Example: {person: {first_name: "Or"}} → {"person.first_name": "Or"}
 *
 * @param obj - The object to flatten
 * @param prefix - Internal parameter for recursion, tracks the current path
 * @returns Flattened object with dot-notation keys
 */
export function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    // Skip null and undefined
    if (value === null || value === undefined) {
      result[newKey] = value;
      continue;
    }

    // Check if value is a plain object (not array, not null, not Date, etc.)
    const isPlainObject =
      typeof value === 'object' && !Array.isArray(value) && value.constructor === Object;

    if (isPlainObject) {
      // Recursively flatten nested objects
      const flattened = flattenObject(value as Record<string, unknown>, newKey);
      Object.assign(result, flattened);
    } else {
      // Primitive, array, or other type - keep as-is
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Unflattens a dot-notation object back into nested structure.
 * Example: {"person.first_name": "Or"} → {person: {first_name: "Or"}}
 *
 * @param flattened - Object with dot-notation keys
 * @returns Nested object structure
 */
export function unflattenObject(flattened: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flattened)) {
    const parts = key.split('.');
    let current: Record<string, unknown> = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        // Set the final value
        current[part] = value;
      } else {
        // Create nested object if it doesn't exist
        if (!current[part] || typeof current[part] !== 'object' || Array.isArray(current[part])) {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
      }
    }
  }

  return result;
}
