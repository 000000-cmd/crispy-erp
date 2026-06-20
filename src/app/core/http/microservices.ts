/**
 * Prefijos publicos de cada microservicio del back. Coinciden con el
 * `server.servlet.context-path` que cada servicio expone, y con las rutas
 * que el gateway enruta hacia el upstream correspondiente.
 *
 * Centralizar estos prefijos aqui permite que un cambio de nombre del
 * microservicio (poco frecuente) sea un solo edit, en vez de un find &
 * replace por todos los `*.api.ts`. Las rutas concretas dentro de cada
 * microservicio (`/users/me`, `/constants`, etc.) viven en sus respectivos
 * `*.api.ts` porque dependen del feature.
 */
export const MICROSERVICES = {
  AUTH: 'auth',
  SYSTEM: 'system',
  ELASTIC: 'search',
  AUDIT: 'audit',
  BUSINESS: 'business'
} as const;

export type Microservice = (typeof MICROSERVICES)[keyof typeof MICROSERVICES];

/**
 * Compone un path absoluto a partir de un prefijo de microservicio y una
 * ruta relativa. Acepta la ruta con o sin `/` inicial.
 *
 * @example
 *   ms(MICROSERVICES.SYSTEM, 'constants')          // 'system/constants'
 *   ms(MICROSERVICES.SYSTEM, '/constants/enabled') // 'system/constants/enabled'
 */
export function ms(prefix: Microservice, path: string): string {
  return `${prefix}/${path.replace(/^\//, '')}`;
}
