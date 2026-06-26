## Problem
En `/kanban`, las cartas no se pueden soltar en columnas vacías ni siempre re-mover entre columnas porque:

1. `DroppableEmpty` se registra con id `empty-${columnId}` y `data.type: "column"`, pero `onDragOver` busca la columna destino con `prev.columns.find(c => c.id === overId)` — no encuentra ninguna (id real ≠ `empty-xxx`), entonces aborta y la carta no se mueve.
2. Por la misma razón `onDragEnd` también ignora ese drop.

Como resultado, una vez que una columna queda vacía ya no se puede volver a llenar, y mover hacia ciertas columnas falla "después de N veces".

## Solución
En `src/routes/_authenticated/kanban.tsx`, dentro de `onDragOver` y `onDragEnd`:

- Resolver el id real de la columna destino usando `over.data.current?.columnId ?? overId` cuando `over.data.current?.type === "column"`. Así el droppable de columna vacía (`empty-<colId>`) se mapea a su columna real.
- Tras el fix, mover cartas hacia cualquier columna (vacía o no) funciona de forma ilimitada.

No se tocan estilos, traducciones ni la lógica de reordenamiento dentro de la misma columna.

## Verificación
- `bun run build` pasa.
- Manualmente en preview: arrastrar una carta a una columna vacía la coloca dentro; luego vaciar la columna original y volver a arrastrar funciona repetidamente entre todas las columnas.