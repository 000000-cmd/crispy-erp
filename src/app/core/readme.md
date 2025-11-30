# **Core** en Angular

---

## ✔️ ¿Qué **sí** va en `CoreModule`?

### 🔗 **Servicios globales**

Servicios esenciales que se comparten en toda la aplicación:

* Autenticación (AuthService)
* Gestión de usuario actual
* Permisos y roles
* Manejo de tokens
* Comunicación base con backend (HttpClient wrappers)

### 🛡️ **Interceptors**

Todo lo referente a la manipulación global de las peticiones HTTP:

* Añadir token automáticamente
* Interceptar y gestionar errores **401 / 403**
* Loading global
* Logging o auditoría

### 🚧 **Guards**

* `AuthGuard`
* `RoleGuard`
* Otros guards compartidos por varios módulos

### ⚙️ **Configuración global**

* Archivos `environment` (prod, dev, staging...)
* Constantes globales
* Inicializadores de la app (`APP_INITIALIZER`)

### 🧭 **Servicios Singleton**

Servicios que deben tener **una única instancia** en toda la app:

* Configuración
* Estado global
* Observables globales
* Servicios de sistema (ThemeService, AppStatusService, etc.)

---

## ❌ ¿Qué **NO** va en `CoreModule`?

### 🚫 Componentes visuales

Nada que se muestre en pantalla:

* No componentes
* No layouts
* No modales ni popups

### 🚫 Pipes o directivas reutilizables

Estos pertenecen a **Shared**, ya que pueden ser usados por varios módulos.

### 🚫 Servicios específicos de módulos

Ejemplos:

* Servicios de "Clientes"
* Servicios de "Ventas"
* Servicios de "Inventario"

Estos deben ir en el módulo correspondiente.

---

## 📌 Regla de oro del módulo Core

### **Core se importa solo una vez: en `AppModule`.**

Nunca debe importarse en módulos secundarios o lazy modules.

> Si se importa más de una vez, los servicios dejarán de ser singleton ⚠️

---

## 📝 Resumen visual

```json
CoreModule
├── ✔ Servicios globales
├── ✔ Interceptors
├── ✔ Guards
├── ✔ Configuración global
├── ✔ Servicios singleton
└── ❌ Nada visual / Nada específico
```

---

Si deseas, puedo generar también una versión extendida, con ejemplos de código, estructura de carpetas o diagramas.
