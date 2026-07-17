import { Injectable } from '@nitrostack/core';
import { DiscoveryProvider } from './discovery.provider.js';
import { Campaign, Company } from '../../shared/models.js';

@Injectable()
export class MockProvider extends DiscoveryProvider {
  async discover(campaign: Campaign): Promise<Company[]> {
    const industry = campaign.targetIndustry || 'SaaS';
    const location = campaign.targetLocation || 'Bangalore';
    const minEmp = campaign.minEmployees ?? 20;
    const maxEmp = campaign.maxEmployees ?? 100;

    const getEmpCount = (min: number, max: number, index: number) => {
      const step = (max - min) / 4;
      return Math.round(min + step * index);
    };

    return [
      {
        id: `comp-${industry.toLowerCase()}-001`,
        name: `${industry}ify Solutions`,
        location: location,
        industry: industry,
        employeeCount: getEmpCount(minEmp, maxEmp, 0) || 10,
        address: 'Mock Street 1',
        placeId: 'mock-place-001',
        website: 'https://mock1.example.com',
        phone: '+91 9999999991',
        rating: 4.5,
        categories: [industry, 'Technology'],
        source: 'mock',
        confidence: 1.0,
      },
      {
        id: `comp-${industry.toLowerCase()}-002`,
        name: `Apex ${industry} Corp`,
        location: location,
        industry: industry,
        employeeCount: getEmpCount(minEmp, maxEmp, 1) || 25,
        address: 'Mock Street 2',
        placeId: 'mock-place-002',
        website: 'https://mock2.example.com',
        phone: '+91 9999999992',
        rating: 4.2,
        categories: [industry, 'Consulting'],
        source: 'mock',
        confidence: 1.0,
      },
      {
        id: `comp-${industry.toLowerCase()}-003`,
        name: `Flow${industry} Technologies`,
        location: location,
        industry: industry,
        employeeCount: getEmpCount(minEmp, maxEmp, 2) || 45,
        address: 'Mock Street 3',
        placeId: 'mock-place-003',
        website: 'https://mock3.example.com',
        phone: '+91 9999999993',
        rating: 4.0,
        categories: [industry, 'Development'],
        source: 'mock',
        confidence: 1.0,
      },
      {
        id: `comp-${industry.toLowerCase()}-004`,
        name: `${industry} Labs`,
        location: location,
        industry: industry,
        employeeCount: getEmpCount(minEmp, maxEmp, 3) || 70,
        address: 'Mock Street 4',
        placeId: 'mock-place-004',
        website: 'https://mock4.example.com',
        phone: '+91 9999999994',
        rating: 4.7,
        categories: [industry, 'Research'],
        source: 'mock',
        confidence: 1.0,
      },
      {
        id: `comp-${industry.toLowerCase()}-005`,
        name: `NextGen ${industry} India`,
        location: location,
        industry: industry,
        employeeCount: getEmpCount(minEmp, maxEmp, 4) || 95,
        address: 'Mock Street 5',
        placeId: 'mock-place-005',
        website: 'https://mock5.example.com',
        phone: '+91 9999999995',
        rating: 4.4,
        categories: [industry, 'Enterprise'],
        source: 'mock',
        confidence: 1.0,
      },
    ];
  }
}
