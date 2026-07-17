import { Module } from '@nitrostack/core';
import { DiscoveryService } from './discovery.service.js';
import { GooglePlacesProvider } from './providers/google-places.provider.js';
import { MockProvider } from './providers/mock.provider.js';
import { BusinessValidatorService } from './providers/business-validator.service.js';
import { DiscoveryTools } from './discovery.tools.js';

@Module({
  name: 'discovery',
  description: 'Discovers companies matching campaign criteria',
  providers: [
    DiscoveryService,
    GooglePlacesProvider,
    MockProvider,
    BusinessValidatorService,
  ],
  controllers: [DiscoveryTools],
  exports: [
    DiscoveryService,
    GooglePlacesProvider,
    MockProvider,
    BusinessValidatorService,
  ],
})
export class DiscoveryModule {}
