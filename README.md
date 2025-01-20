# SSH-Llama

A TypeScript library that uses Ollama to parse SSH output into structured data using Zod schemas.

## Features

- Parse raw SSH output into structured JSON objects
- Type-safe parsing with Zod schemas
- Local LLM processing using Ollama

## Prerequisites

- Node.js (>= 18.17.0)
- npm
- [Ollama](https://ollama.ai/) installed and running locally

## Installation

```bash
npm install ssh-llama
```

## Usage

First, define your Zod schema for the data structure you want to parse:

```typescript
import { z } from 'zod';
import { parseSSHWithSchema } from './sshTransformer';

const schema = z.object({
  hostname: z.string(),
  uptime: z.number(),
  users: z.array(z.string()),
});

// Example SSH output
const sshOutput = `Linux webserver-prod-01 5.15.0-1054-aws
14:23:02 up 14 days, 6:42, 3 users
USER     TTY      FROM             LOGIN@   IDLE
ubuntu   pts/0    172.31.45.2      14:20    1.00s
jenkins  pts/1    172.31.45.2      10:15    3:12
deploy   pts/2    172.31.45.2      13:45    2.00s`;

// Parse the output
const result = await parseSSHWithSchema(schema, 'llama2', sshOutput);
console.log(result);
// {
//   hostname: 'webserver-prod-01',
//   uptime: 1209600,
//   users: ['ubuntu', 'jenkins', 'deploy']
// }
```

## API Reference

### `parseSSHWithSchema<T>(schema: ZodSchema<T>, model: string, rawSSHString: string): Promise<T | null>`

Parses raw SSH output into a structured object based on a given Zod schema.

#### Parameters

- `schema`: A Zod schema that defines the structure of the output
- `model`: The Ollama model to use (e.g., "llama2")
- `rawSSHString`: The raw SSH output to parse

#### Returns

- A promise that resolves to either the parsed object matching the schema or `null` if parsing fails

## Development

### Building

```bash
npm run build
```

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Running Example

```bash
npm run example
```

## Supported Device Types

The library has been tested with various network device outputs:

- Linux servers
- Cisco IOS switches
- FortiGate firewalls
- Aruba switches

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
