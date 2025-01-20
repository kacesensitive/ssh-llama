import { z } from 'zod';
import { parseSSHWithSchema } from './sshTransformer';
import * as ollama from 'ollama';

// Mock ollama
jest.mock('ollama', () => ({
  chat: jest.fn(),
}));

describe('parseSSHWithSchema', () => {
  const mockSchema = z.object({
    hostname: z.string(),
    uptime: z.number(),
    users: z.array(z.string()),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully parse SSH output when valid', async () => {
    const mockResponse = {
      message: {
        content: JSON.stringify({
          hostname: 'test-server',
          uptime: 3600,
          users: ['user1', 'user2'],
        }),
      },
    };

    // @ts-expect-error - mocking the ollama module
    ollama.chat.mockResolvedValueOnce(mockResponse);

    const result = await parseSSHWithSchema(
      mockSchema,
      'llama2',
      'Some raw SSH output',
    );

    expect(result).toEqual({
      hostname: 'test-server',
      uptime: 3600,
      users: ['user1', 'user2'],
    });
    // @ts-expect-error - accessing mock property
    expect(ollama.chat.mock.calls.length).toBe(1);
  });

  it('should return null when parsing fails', async () => {
    const mockResponse = {
      message: {
        content: 'invalid json',
      },
    };

    // @ts-expect-error - mocking the ollama module
    ollama.chat.mockResolvedValueOnce(mockResponse);

    const result = await parseSSHWithSchema(
      mockSchema,
      'llama2',
      'Some raw SSH output',
    );

    expect(result).toBeNull();
    // @ts-expect-error - accessing mock property
    expect(ollama.chat.mock.calls.length).toBe(1);
  });

  it('should successfully parse SSH output when valid', async () => {
    const mockResponse = {
      message: {
        content: JSON.stringify({
          hostname: 'webserver-prod-01',
          uptime: 1209600, // 14 days in seconds
          users: ['ubuntu', 'jenkins', 'deploy'],
        }),
      },
    };

    // @ts-expect-error - mocking the ollama module
    ollama.chat.mockResolvedValueOnce(mockResponse);

    const result = await parseSSHWithSchema(
      mockSchema,
      'llama2',
      `Linux webserver-prod-01 5.15.0-1054-aws #56-Ubuntu SMP Thu Nov 3 13:00:56 UTC 2023 x86_64
      14:23:02 up 14 days, 6:42, 3 users, load average: 0.08, 0.03, 0.01
      USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
      ubuntu   pts/0    172.31.45.2      14:20    1.00s  0.04s  0.00s w
      jenkins  pts/1    172.31.45.2      10:15    3:12   1.20s  0.37s /usr/bin/python3
      deploy   pts/2    172.31.45.2      13:45    2.00s  0.15s  0.08s /bin/bash`,
    );

    expect(result).toEqual({
      hostname: 'webserver-prod-01',
      uptime: 1209600,
      users: ['ubuntu', 'jenkins', 'deploy'],
    });
    // @ts-expect-error - accessing mock property
    expect(ollama.chat.mock.calls.length).toBe(1);
  });

  it('should return null when parsing fails', async () => {
    const mockResponse = {
      message: {
        content: 'invalid json',
      },
    };

    // @ts-expect-error - mocking the ollama module
    ollama.chat.mockResolvedValueOnce(mockResponse);

    const result = await parseSSHWithSchema(
      mockSchema,
      'llama2',
      `Connection to host lost.
      ssh: connect to host 10.0.1.123 port 22: Connection timed out`,
    );

    expect(result).toBeNull();
    // @ts-expect-error - accessing mock property
    expect(ollama.chat.mock.calls.length).toBe(1);
  });

  it('should parse Cisco switch output', async () => {
    const mockResponse = {
      message: {
        content: JSON.stringify({
          hostname: 'CORE-SW01',
          uptime: 7776000, // 90 days in seconds
          users: ['admin', 'netops'],
        }),
      },
    };

    // @ts-expect-error - mocking the ollama module
    ollama.chat.mockResolvedValueOnce(mockResponse);

    const result = await parseSSHWithSchema(
      mockSchema,
      'llama2',
      `CORE-SW01#show version
      Cisco IOS Software, C3750E Software (C3750E-UNIVERSALK9-M), Version 15.2(4)E7
      BOOTLDR: C3750E Boot Loader (C3750X-HBOOT-M) Version 15.2(4)E7
      System image file is "flash:c3750e-universalk9-mz.152-4.E7.bin"
      Last reload reason: power-on

      Cisco WS-C3750X-48P (PowerPC405) processor with 262144K bytes of memory
      Switch Uptime is 90 days, 4 hours, 12 minutes
      Current configuration : 4624 bytes

      Name: CORE-SW01
      Username                             Type
      admin                               priv-15
      netops                              priv-15`,
    );

    expect(result).toEqual({
      hostname: 'CORE-SW01',
      uptime: 7776000,
      users: ['admin', 'netops'],
    });
  });

  it('should parse FortiGate firewall output', async () => {
    const mockResponse = {
      message: {
        content: JSON.stringify({
          hostname: 'FG-DC1-EDGE01',
          uptime: 2592000, // 30 days in seconds
          users: ['admin', 'readonly', 'audituser'],
        }),
      },
    };

    // @ts-expect-error - mocking the ollama module
    ollama.chat.mockResolvedValueOnce(mockResponse);

    const result = await parseSSHWithSchema(
      mockSchema,
      'llama2',
      `FG-DC1-EDGE01 # get system status
      Version: FortiGate-VM64-KVM v7.2.5,build1379,221205 (GA)
      Serial-Number: FGVMXXXXXXXXXX
      Hostname: FG-DC1-EDGE01
      Operation Mode: NAT
      Current virtual domain: root
      Max number of virtual domains: 10
      Virtual domains status: 1 in NAT mode, 0 in TP mode
      Virtual domain configuration: enable
      FIPS-CC mode: disable
      Current HA mode: standalone
      Uptime: 30 days, 0 hours, 15 minutes
      System time: Tue Feb 27 10:30:22 2024

      FG-DC1-EDGE01 # diagnose sys user list
      admin             pts/0    192.168.1.100   2024-02-27 10:25
      readonly          pts/1    192.168.1.101   2024-02-27 09:15
      audituser         pts/2    192.168.1.102   2024-02-27 08:45`,
    );

    expect(result).toEqual({
      hostname: 'FG-DC1-EDGE01',
      uptime: 2592000,
      users: ['admin', 'readonly', 'audituser'],
    });
  });

  it('should parse Aruba switch output', async () => {
    const mockResponse = {
      message: {
        content: JSON.stringify({
          hostname: 'AW-ACCESS-SW02',
          uptime: 5184000, // 60 days in seconds
          users: ['admin', 'operator'],
        }),
      },
    };

    // @ts-expect-error - mocking the ollama module
    ollama.chat.mockResolvedValueOnce(mockResponse);

    const result = await parseSSHWithSchema(
      mockSchema,
      'llama2',
      `AW-ACCESS-SW02# show version

      Aruba Operating System Software.
      ArubaOS (MODEL: Aruba 2930F-48G-PoE+-4SFP+ Switch), Version 16.10.0014
      Copyright (c) 1998-2020 Hewlett Packard Enterprise Development LP
      Compiled on 05/25/2020 at 19:54:44 PDT by release_manager
      ROM: Bootstrap (Primary)
      Serial Number: SG71KL542D
      Uptime is 60 days, 2 hours and 35 minutes
      Last reboot: Cold reboot

      AW-ACCESS-SW02# show user-session

      Currently authenticated users:

      Username     Type      Auth     Port  Access VLAN
      ------------ --------- -------- ----- -----------
      admin        Manager   Local    1     1
      operator     Operator  Local    2     1`,
    );

    expect(result).toEqual({
      hostname: 'AW-ACCESS-SW02',
      uptime: 5184000,
      users: ['admin', 'operator'],
    });
  });
});
