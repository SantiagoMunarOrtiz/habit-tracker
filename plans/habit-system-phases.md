# Plan de Rediseño del Sistema de Hábitos por Fases

## Fase 1: Limpieza y Base de Datos (Backend Core)
* **Objetivo:** Preparar el terreno eliminando la lógica antigua y estableciendo los nuevos modelos.
* **Acciones:**
  * Actualizar `schema.prisma`: Eliminar el campo `bankedDays` de `Habit`.
  * Crear el nuevo modelo `HabitAchievement` relacionado uno a muchos con `Habit`.
  * Ejecutar migraciones de Prisma para sincronizar la base de datos.
  * Eliminar por completo referencias a "R days", "Golden days" y "Banked days" en el backend.

## Fase 2: Lógica de Hábitos y Reemplazo Semanal
* **Objetivo:** Implementar el corazón matemático del nuevo sistema.
* **Acciones:**
  * Refactorizar `habitService.ts` (`checkInHabit`).
  * Crear la utilidad/algoritmo de cálculo semanal.
  * Lógica: Identificar días obligatorios vs opcionales de la semana en curso.
  * Lógica: Emparejar un día opcional completado con un día obligatorio perdido (1 a 1), solo dentro de la misma semana.
  * Asegurar que el Vacation Mode se integre aquí: si un día obligatorio cae en vacaciones, no cuenta como perdido.

## Fase 3: Sistema de Logros (Achievements)
* **Objetivo:** Conectar las completaciones reales con los hitos científicos.
* **Acciones:**
  * Implementar lógica en el backend que cuente las completaciones totales por hábito.
  * Al llegar a hitos exactos (1, 3, 7, 10, 30, 66, 90, 180, 365), crear un registro en `HabitAchievement`.
  * Asegurar que no se otorguen logros duplicados para el mismo hito en el mismo hábito.

## Fase 4: Analíticas y Endpoints
* **Objetivo:** Procesar los datos para el frontend basándose en la nueva lógica.
* **Acciones:**
  * Refactorizar `analyticsService.ts` para usar el motor de reemplazo semanal.
  * Crear/ajustar endpoints de la API para devolver datos filtrables por Día, Mes y Año.
  * Exponer métricas: completados, obligatorios reemplazados, perdidos, racha actual, mejor racha.

## Fase 5: Interfaz del Calendario (Frontend)
* **Objetivo:** Permitir al usuario navegar por meses y ver claramente el estado de sus días.
* **Acciones:**
  * Implementar estado de navegación (`<` Mes Anterior, `>` Mes Siguiente) en el componente del Calendario.
  * Renderizar los días con colores o iconos distintos (Verde=Obligatorio Completado, Azul=Reemplazo, Rojo=Perdido, etc.).

## Fase 6: Gráficos de Analíticas y UI de Logros (Frontend)
* **Objetivo:** Mostrar los gráficos profesionales y las medallas de logros.
* **Acciones:**
  * Diseñar gráficos (Recharts o similar) para Día, Mes, Año.
  * Crear la sección visual de logros por hábito, mostrando bloqueados, desbloqueados y el progreso hacia el próximo hito.
  * Pruebas finales end-to-end asegurando que todo encaje.