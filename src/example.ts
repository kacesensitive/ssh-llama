import { z } from 'zod';
import { parseSSHWithSchema } from './index';

// Define a Zod schema for the SSH output
const SSHSchema = z.object({
  user: z.string().describe('The SSH user'),
  host: z.string().describe('The SSH host'),
  ip: z.string().optional().describe('The IP address'),
  port: z.number().optional().describe('The port number'),
});

async function main() {
  const rawSSHString = `
    user: admin
    host: example.com
    ip: 192.168.1.1
    port: 22
  `;

  const model = 'llama3.2';

  try {
    const parsedResult = await parseSSHWithSchema(
      SSHSchema,
      model,
      rawSSHString,
    );

    if (parsedResult) {
      console.log('Parsed SSH Output:', parsedResult);
    } else {
      console.log('Failed to parse SSH output.');
    }
  } catch (error) {
    console.error('Error parsing SSH output:', error);
  }
}

main().catch(console.error);
