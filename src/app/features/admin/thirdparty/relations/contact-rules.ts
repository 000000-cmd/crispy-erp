/**
 * Reglas de validación/máscara por CÓDIGO de tipo de contacto (regla del
 * proyecto: los condicionales sobre catálogos van por código, no por id).
 */
export interface ContactRule {
  mask: 'phone' | 'none';
  pattern: RegExp;
  placeholder: string;
  help: string;
}

export const CONTACT_RULES: Record<string, ContactRule> = {
  MOBILE:    { mask: 'phone', pattern: /^3\d{2} \d{3} \d{4}$/, placeholder: '300 123 4567', help: 'Celular de 10 dígitos (empieza por 3).' },
  WHATSAPP:  { mask: 'phone', pattern: /^3\d{2} \d{3} \d{4}$/, placeholder: '300 123 4567', help: 'Número de WhatsApp (10 dígitos).' },
  PHONE:     { mask: 'phone', pattern: /^\d{3} \d{3} \d{4}$/, placeholder: '601 234 5678', help: 'Teléfono fijo de 10 dígitos.' },
  EMAIL:     { mask: 'none',  pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, placeholder: 'correo@dominio.com', help: 'Correo electrónico válido.' },
  INSTAGRAM: { mask: 'none',  pattern: /^@?[A-Za-z0-9._]{2,30}$/, placeholder: '@usuario', help: 'Usuario de Instagram.' },
  OTHER:     { mask: 'none',  pattern: /^.{2,}$/, placeholder: 'Valor del contacto', help: '' },
};

export const DEFAULT_CONTACT_RULE: ContactRule = CONTACT_RULES['OTHER'];
