
# 🧱 **Layout** en Angular

El módulo **Layout** agrupa los componentes que construyen la estructura visual global de la aplicación. Son elementos que se muestran en la mayoría de pantallas y definen el "esqueleto" general del proyecto.

## ✔️ ¿Qué es el Layout?

El Layout incluye componentes que:

* Están presentes en casi todas las pantallas
* Forman la estructura visual principal
* No contienen lógica de negocio
* Sirven como contenedor de la navegación y la UI global

---

## ✔️ Componentes típicos del Layout

* **Sidebar** (barra lateral de navegación)
* **Navbar / Header** (parte superior)
* **Footer** (pie de página global)
* **ShellComponent** (contenedor principal)
* **PageContainer** (estructura base por página)
* **ThemeSwitcher** (cambio de tema claro/oscuro)
* **BreadCrumbs** (ruta de navegación)

---

## 📐 Estructura típica de un layout

```bash
<app-shell>
  <app-sidebar></app-sidebar>
  <app-header></app-header>
  <router-outlet></router-outlet>
</app-shell>
```

El Layout NO contiene lógica de negocio. Su objetivo es únicamente estructural y visual.

---
