/**
 * GrowthPilot MCP Server
 * 
 * AI-powered B2B outbound sales automation pipeline exposed as an MCP server.
 * Orchestrates a 7-stage workflow: Plan → Discover → Validate → Research → Qualify → Draft → Critique.
 * 
 * Integrates Google Places API (discovery), Tavily API (research), and Gemini 1.5 Flash (reasoning).
 * Uses the @McpApp decorator pattern for clean, NestJS-style modular architecture.
 * 
 * Transport Configuration:
 * - Development (NODE_ENV=development): STDIO only
 * - Production (NODE_ENV=production): Dual transport (STDIO + HTTP SSE)
 */

import 'dotenv/config';
import { McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './app.module.js';

/**
 * Bootstrap the application
 */
async function bootstrap() {
  // Create and start the MCP server
  const server = await McpApplicationFactory.create(AppModule);
  await server.start();
}

// Start the application
bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
