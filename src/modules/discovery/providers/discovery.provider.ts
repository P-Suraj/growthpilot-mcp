import { Campaign, Company } from '../../shared/models.js';

export abstract class DiscoveryProvider {
  abstract discover(campaign: Campaign): Promise<Company[]>;
}
