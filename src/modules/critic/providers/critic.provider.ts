import { Draft, Critique } from '../../shared/models.js';

export abstract class CriticProvider {
  abstract readonly name: string;
  abstract critique(draft: Draft): Promise<Critique>;
  abstract revise(draft: Draft, critique: Critique): Promise<Draft>;
}
