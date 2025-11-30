# **Shared** en Angular

El módulo **Shared** contiene todos los elementos **reutilizables** que pueden usarse en múltiples módulos funcionales sin pertenecer directamente a ninguno.

---

## ✔️ ¿Qué contiene el SharedModule?

### 🧩 **Componentes reutilizables**

Componentes UI genéricos que pueden usarse en cualquier parte de la app:

* Botones personalizados
* Tablas reutilizables
* Diálogos / Modales
* Paginadores (Paginator)
* Avatares
* Cards genéricos

---

### 🧭 **Directivas**

Directivas que agregan comportamiento visual o funcional:

* `Autofocus`
* Directivas de permisos
* Directivas de interacción o UI

---

### 🔄 **Pipes reutilizables**

Transformaciones universales:

* Fechas
* Monedas
* Truncar texto
* Formateo de strings o números

---

### 🎨 **Módulos de UI**

Imports que exponen componentes externos:

* Angular Material
* PrimeNG
* NGX-Charts
* Librerías de UI externas

Se importan aquí y se vuelven a exportar para no repetirlos en todos los módulos.

---

### 📘 **Modelos e Interfaces**

Interfaces y tipos usados en varios lugares:

* `User`
* `Cliente`
* `Producto`
* DTOs y modelos genéricos

---

## ❌ Lo que **NO** va en Shared

### 🚫 Servicios globales

Los servicios compartidos a nivel de app van en **Core**, no aquí.

### 🚫 Componentes específicos de una pantalla

Shared es para reutilización. Los componentes que pertenecen exclusivamente a un dominio (por ejemplo, "cliente-list") van en su propio FeatureModule.

---

## 📌 Nota importante

### **Shared se importa en muchos módulos. No es singleton.**

Cada módulo carga su propia copia.

Shared sirve para evitar duplicación de código, no para manejar estado global.

---

Si deseas, puedo crear ahora los README de **Utils**, **AppModule**, **Routing**, o incluso un README principal que explique toda la arquitectura del proyecto Angular.
