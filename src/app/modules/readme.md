# 🧩 Guía de **Módulos de Dominio (Feature Modules)** en Angular

Los **Feature Modules** representan dominios funcionales completos dentro de la aplicación. Cada módulo agrupa todo lo necesario para operar un área específica del negocio.

Ejemplos típicos de dominios:

* Clientes
* Usuarios
* Roles
* Inventario
* Productos
* Facturación
* Ventas
* Reportes

---

## ✔️ ¿Qué debe contener cada módulo de dominio?

### 🧱 1. **Componentes del dominio (pantallas)**

Cada módulo contiene sus propios componentes relacionados con su propósito.

Ejemplo para el dominio *Clientes*:

* `cliente-list`
* `cliente-form`
* `cliente-detalle`
* Otros componentes específicos

Estos componentes **no se comparten globalmente** y tampoco pertenecen a Shared.

---

### 🔧 2. **Servicios específicos del dominio**

Cada módulo contiene servicios que solo tienen sentido dentro de ese dominio.

Ejemplos:

* `ClienteService`
* `ProductoService`
* `OrdenService`

> Estos servicios **NO son globales**, no van en Core. Son exclusivos del dominio.

---

### 🛣️ 3. **Routing separado por dominio**

Cada módulo debe tener su propio archivo de rutas, por ejemplo:

* `clientes-routing.module.ts`

Con rutas como:

```bash
/clientes/list
/clientes/nuevo
/clientes/:id
```

Esto mantiene la app organizada y facilita el lazy loading.

---

### 🧠 4. **Lógica de negocio específica del dominio**

Cada módulo contiene la lógica particular del área:

* Validaciones propias del dominio
* Permisos locales del módulo
* Transformadores o adaptadores de datos
* Manejo de estado interno

Esta lógica **no debe ir al Core**.

---

## 🌐 Resumen visual

```bash
clientes/
├── clientes.module.ts
├── clientes-routing.module.ts
├── pages/
│   ├── cliente-list.component.ts
│   ├── cliente-form.component.ts
│   └── cliente-detalle.component.ts
├── services/
│   └── cliente.service.ts
└── utils/ (opcional)
    ├── validators.ts
    └── adapters.ts
```

Si deseas, puedo preparar también una guía para **Shared**, **Utils**, **Pages**, o reglas de arquitectura completa para Angular.
