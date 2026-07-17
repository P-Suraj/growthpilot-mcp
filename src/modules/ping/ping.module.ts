import { Module } from '@nitrostack/core';
import { PingTools } from './ping.tools.js';

@Module({
  name: 'ping',
  description: 'Ping test module for basic connectivity validation',
  controllers: [PingTools]
})
export class PingModule {}
