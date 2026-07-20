/**
 * Liquidación de comisiones. El SALDO es un read model materializado que se lee
 * de Elasticsearch (rápido, no toca la BD transaccional); confirmar la
 * liquidación sí va contra finance-service, que es quien mueve el dinero.
 *
 * `amountAccrued` se alimentará del módulo de citas/servicios prestados; hasta
 * entonces llega en 0 y la pantalla lo refleja tal cual (sin inventar cifras).
 */

/** Saldo por cobrar de un empleado, proyectado en Elasticsearch. */
export interface EmployeeBalance {
  id: string;
  businessId: string;
  branchId: string | null;
  employeeId: string;
  thirdPartyId: string | null;
  userId: string | null;
  amountAccrued: number;
  amountPaid: number;
  /** Por cobrar = devengado − pagado. Es lo que se liquida. */
  balance: number;
  currency: string;
  lastCalculatedAt?: string | null;
}

/** Movimiento confirmado (auditoría de tesorería). */
export interface Settlement {
  id: string;
  businessId: string;
  branchId: string | null;
  employeeId: string;
  amount: number;
  /** Saldo por cobrar previo, congelado para auditar sin recalcular historia. */
  balanceBefore: number;
  currency: string;
  settledAt: string;
  note?: string | null;
}

/** Sin `amount` se liquida todo el saldo por cobrar del empleado. */
export interface SettlementDraft {
  employeeId: string;
  amount?: number | null;
  note?: string | null;
}

/** Fila de la pantalla: saldo + la persona ya resuelta. */
export interface SettlementRow {
  employeeId: string;
  personName: string;
  photoUrl: string | null;
  branchId: string | null;
  branchName: string;
  positionName: string;
  accrued: number;
  paid: number;
  pending: number;
  currency: string;
}
