# Parcial 2 - Confiabilidad y MLOps en Producción

**Estudiante:** Martin Eduardo Cristancho Salazar  
**Programa:** Ingeniería de Software

## Contenido

- `Parcial_2_Confiabilidad_MLOps.pdf`: respuestas escritas de las cinco preguntas, incluidos procedimientos y análisis.
- `promocion.py`: implementación propuesta para la pregunta 4, con simulador de registro y cuatro pruebas unitarias.
- `regresion_original.py`: reproducción de la lógica original del enunciado y cuatro pruebas que exponen sus fallos (se espera que fallen).

## Cómo ejecutar

Requiere Python 3.10 o posterior. No requiere paquetes externos.

Desde la carpeta `parcial2/`:

```bash
python promocion.py -v
```

Resultado esperado: **4 pruebas OK**.

Para observar los fallos de la versión original:

```bash
python regresion_original.py -v
```

Resultado esperado: **4 fallos intencionales**. El comando devuelve un código de salida distinto de cero porque demuestra los defectos.

## Alcance

`Registro` es un simulador secuencial con rollback para demostrar la lógica; no sustituye una base de datos con transacciones reales, bloqueos y control de concurrencia. Los umbrales de AUC y recall de la propuesta son ejemplos de una política de promoción que debe acordarse con negocio.

Para entregar junto al Parcial 1, copiar esta carpeta `parcial2/` a la raíz del repositorio `parciales-nov2026`, al lado de `parcial1/`. No copiar la carpeta `paquete_parcial2` ni crear una carpeta `parcial2` dentro de otra.
