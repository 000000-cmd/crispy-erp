import { effect, signal, Signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

/**
 * Crea una signal "tick" que sube cada vez que el AbstractControl recibido
 * emite cualquier evento (status, value, touched, dirty). Sirve como
 * dependencia explicita para `computed()` que leen propiedades NO reactivas
 * del control (`touched`, `dirty`, `errors`, `valid`).
 *
 * Sin esto, llamar `markAllAsTouched()` no propaga al template porque ningun
 * signal cambia y los `computed` devuelven valores cacheados.
 *
 * Debe llamarse en injection context (constructor del componente).
 */
export function controlTick(controlSig: Signal<AbstractControl | null | undefined>): Signal<number> {
  const tick = signal(0);
  let sub: Subscription | null = null;
  effect((onCleanup) => {
    const c = controlSig();
    sub?.unsubscribe();
    sub = null;
    if (!c) return;
    // Angular 18+ expose `events` (incluye TouchedChangeEvent / PristineChangeEvent).
    const events = (c as any).events;
    if (events?.subscribe) {
      sub = events.subscribe(() => tick.update(v => v + 1));
    } else {
      const s1 = c.statusChanges.subscribe(() => tick.update(v => v + 1));
      const s2 = c.valueChanges.subscribe(() => tick.update(v => v + 1));
      sub = new Subscription();
      sub.add(s1); sub.add(s2);
    }
    onCleanup(() => sub?.unsubscribe());
  });
  return tick;
}
