# 💰 Finance Tracker - Aplicación de Gestión Financiera

Una aplicación moderna de seguimiento financiero desarrollada con Angular 18+ que utiliza **Angular Signals** y **LocalStorage** para la persistencia de datos.

## 🚀 Características Principales

### ✅ Completado

- **Gestión de Transacciones**: Agregar, editar y eliminar transacciones de ingresos y gastos
- **Dashboard Interactivo**: Estadísticas en tiempo real con tarjetas dinámicas
- **Filtrado Avanzado**: Filtrar transacciones por tipo, categoría y búsqueda de texto
- **Gráfico de Categorías**: Visualización de gastos por categoría
- **Persistencia con LocalStorage**: Los datos se guardan automáticamente en el navegador
- **Responsive Design**: Optimizado para móviles y escritorio
- **Navegación por Rutas**: SPA completa con Angular Router

### 🆕 Nuevas Características (v2.0)

- **Sistema de Persistencia**: Migración completa de datos hardcodeados a LocalStorage
- **Gestión de Configuración**: Página de configuración para importar/exportar datos
- **Validación de Datos**: Sistema robusto de validación de transacciones
- **Inicialización Automática**: Carga datos de ejemplo en la primera visita
- **Backup y Restauración**: Funciones para exportar e importar datos como JSON

## 🏗️ Arquitectura

### Tecnologías Utilizadas

- **Angular 18+** con Signals
- **TypeScript**
- **SCSS** para estilos
- **Angular Reactive Forms**
- **LocalStorage API**
- **Angular Router**

### Estructura del Proyecto

```
src/app/
├── components/
│   ├── dashboard/          # Dashboard principal
│   ├── transaction-list/   # Lista de transacciones con filtros
│   ├── transaction-form/   # Formulario modal para agregar/editar
│   ├── category-chart/     # Gráfico de categorías
│   └── settings/           # Configuración y gestión de datos
├── services/
│   ├── transaction.service.ts    # Servicio principal de transacciones
│   └── local-storage.service.ts  # Servicio para manejo de LocalStorage
├── models/
│   ├── transaction.model.ts      # Interfaces y tipos
│   └── mock-data.ts             # Datos de ejemplo
├── constants/
│   └── storage-keys.ts          # Constantes para claves de LocalStorage
└── app.routes.ts               # Configuración de rutas
```

## 🛠️ Servicios

### TransactionService

- **Estado Reactivo**: Usa Angular Signals para estado global
- **Computed Values**: Cálculos automáticos de totales y balance
- **Persistencia Automática**: Guarda cambios en LocalStorage
- **Operaciones CRUD**: Crear, leer, actualizar y eliminar transacciones
- **Importar/Exportar**: Funciones para backup y restauración

### LocalStorageService

- **Manejo Seguro**: Encapsula todas las operaciones con try/catch
- **Tipado Genérico**: Soporte para cualquier tipo de dato
- **Validación**: Verificación de existencia de claves

## 📱 Páginas y Funcionalidades

### Dashboard (`/dashboard`)

- Tarjetas de estadísticas (Ingresos, Gastos, Balance)
- Gráfico de categorías
- Lista de transacciones recientes
- Botón de acceso rápido para agregar transacciones

### Lista de Transacciones (`/transactions`)

- Filtrado por tipo (ingresos/gastos)
- Filtrado por categoría
- Búsqueda por texto
- Ordenamiento por fecha
- Eliminación de transacciones

### Agregar Transacción (`/add-transaction`)

- Formulario reactivo con validaciones
- Categorías dinámicas según el tipo
- Validación en tiempo real
- Feedback visual

### Configuración (`/settings`)

- Exportar datos como JSON
- Importar datos desde archivo
- Restaurar datos de ejemplo
- Limpiar todos los datos
- Información de almacenamiento

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+
- pnpm (recomendado) o npm

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd finance-tracker

# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm start

# Construir para producción
pnpm build
```

### Scripts Disponibles

```bash
pnpm start          # Servidor de desarrollo
pnpm build          # Build de producción
pnpm test           # Ejecutar tests
pnpm lint           # Linter
```

## 🗄️ Gestión de Datos

### Estructura de Datos

```typescript
interface Transaction {
  id: number;
  description: string;
  amount: number; // Positivo para ingresos, negativo para gastos
  category: string;
  date: string; // Formato: 'YYYY-MM-DD'
  type: 'income' | 'expense';
}
```

### Claves de LocalStorage

- `finance-tracker-transactions`: Array de transacciones
- `finance-tracker-preferences`: Configuraciones del usuario
- `finance-tracker-version`: Versión de la aplicación

### Migración de Datos

El sistema automáticamente:

1. Verifica si es la primera visita
2. Carga datos de ejemplo si no hay datos existentes
3. Maneja versiones para futuras migraciones

## 🧪 Testing

### Servicios Incluidos

- `TransactionService`: Tests para todas las operaciones CRUD
- `LocalStorageService`: Tests para operaciones de almacenamiento
- `SettingsComponent`: Tests para funciones de configuración

### Ejecutar Tests

```bash
pnpm test
```

## 🔄 Próximas Características

### En Desarrollo

- [ ] Categorías personalizadas
- [ ] Filtros por rango de fechas
- [ ] Gráficos adicionales (líneas de tiempo, comparaciones)
- [ ] Exportación a CSV/PDF
- [ ] Búsqueda avanzada
- [ ] Notificaciones y recordatorios

### Futuras Mejoras

- [ ] Sincronización en la nube
- [ ] Aplicación móvil
- [ ] Análisis de tendencias
- [ ] Presupuestos y metas
- [ ] Múltiples monedas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Tu Nombre** - [GitHub](https://github.com/tu-usuario)

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
