# Funciones de Servidor de Inventario (Firebase Cloud Functions)

Este módulo traslada la lógica de descuento y restauración de stock al servidor (Google Cloud Functions), eliminando la necesidad de que los clientes tengan permisos directos de escritura sobre los documentos de `products` e `ingredients` en Firestore.

## Beneficios de Seguridad
1. **Protección contra vaciado malicioso**: Los clientes no pueden enviar escrituras directas para alterar el stock a `0` sin un pedido real.
2. **Transacciones Atómicas**: Las deducciones de stock de productos terminados e insumos (recetas many-to-many y grupos de opciones) se ejecutan dentro de una transacción (`runTransaction`) garantizando consistencia y evitando condiciones de carrera.
3. **Idempotencia**: Si la función se ejecuta más de una vez por reintentos de red, la marca `stockDeductedAt` previene dobles deducciones.
4. **Restauración Automática**: Cuando una orden pasa a estado `cancelado`, la función `onOrderCancelledRestoreStock` devuelve automáticamente las existencias al inventario.

## Funciones Incluidas
- `onOrderCreatedDeductStock`: Se activa automáticamente al crearse un documento en `orders/{orderId}`.
- `onOrderCancelledRestoreStock`: Se activa automáticamente si la orden cambia a estado `cancelado`.

## Despliegue a Firebase
Para desplegar las funciones en tu proyecto de Firebase:
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```
