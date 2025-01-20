import ollama from 'ollama';
import { ZodSchema } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Parses a raw SSH output string into a structured object based on a given Zod schema.
 *
 * @param schema - The Zod schema used to validate and parse the response.
 * @param model - The Llama model to use (e.g., "llama3.1:8b").
 * @param rawSSHString - The raw SSH output string to parse.
 */
export async function parseSSHWithSchema<T>(
  schema: ZodSchema<T>,
  model: string,
  rawSSHString: string,
): Promise<T | null> {
  // Convert the provided Zod schema to JSON Schema format
  const jsonSchema = zodToJsonSchema(schema);

  // Create the prompt
  const messages = [
    {
      role: 'user',
      content: `Parse the following SSH output into a JSON object that matches this schema:
Schema:
${JSON.stringify(jsonSchema, null, 2)}

SSH Output:
${rawSSHString}`,
    },
  ];

  // Call the Ollama model
  const response = await ollama.chat({
    model: model,
    messages: messages,
    format: jsonSchema, // Use the provided schema for structured output
    options: {
      temperature: 0, // Make responses more deterministic
    },
  });

  // Validate and parse the response
  try {
    const parsedResponse = schema.parse(JSON.parse(response.message.content));
    return parsedResponse;
  } catch (error) {
    console.error('Generated invalid response:', error);
    return null; // Return null in case of validation error
  }
}
