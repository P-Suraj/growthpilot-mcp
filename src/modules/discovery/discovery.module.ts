import { Module } from '@nitrostack/core';
import { DiscoveryService } from './discovery.service.js';
import { GooglePlacesProvider } from './providers/google-places.provider.js';
import { MockProvider } from './providers/mock.provider.js';

@Module({
  name: 'discovery',
  description: 'Discovers companies matching campaign criteria',
  providers: [
    DiscoveryService,
    GooglePlacesProvider,
    MockProvider
  ],
  exports: [
    DiscoveryService,
    GooglePlacesProvider,
    MockProvider
  ]
})
export class DiscoveryModule {}
