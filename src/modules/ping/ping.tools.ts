import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';

export class PingTools {
  @Tool({
    name: 'ping',
    description: 'A simple test tool that returns a pong message to verify the NitroStack server is operational.',
    inputSchema: z.object({
      message: z.string().optional().default('ping').describe('An optional test message to send')
    })
  })
  async ping(input: { message?: string }, ctx: ExecutionContext) {
    ctx.logger.info('Received ping command', { input });
    return {
      status: 'success',
      response: 'pong',
      receivedMessage: input.message || 'ping',
      timestamp: new Date().toISOString()
    };
  }
}
