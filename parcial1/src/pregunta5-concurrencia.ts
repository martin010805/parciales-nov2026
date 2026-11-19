

export interface RegistroTransaccional {
  transaccion<T>(
    operacion: (tx: RegistroTransaccional) => Promise<T>
  ): Promise<T>;

  obtenerProduccion(): Promise<string | null>;
  obtenerMetrica(modelo: string): Promise<number>;
  archivar(modelo: string): Promise<void>;
  marcarProduccion(modelo: string): Promise<void>;
  incrementarPromociones(): Promise<void>;
}

export async function promover(
  registro: RegistroTransaccional,
  candidato: string,
  metrica: number
): Promise<boolean> {

  
  if (typeof candidato !== "string" || candidato.trim() === "") {
    throw new TypeError("El candidato debe tener un nombre válido");
  }

  if (!Number.isFinite(metrica)) {
    throw new RangeError("La métrica debe ser finita");
  }

  return registro.transaccion(async (tx) => {
    const actual = await tx.obtenerProduccion();

    
    if (actual === null) {
      await tx.marcarProduccion(candidato);
      await tx.incrementarPromociones();
      return true;
    }

  
    if (actual === candidato) {
      return false;
    }

    const metricaActual = await tx.obtenerMetrica(actual);

    if (!Number.isFinite(metricaActual)) {
      throw new RangeError("La métrica actual debe ser finita");
    }

    const margen = 0.01;

    
    if (metrica <= metricaActual + margen) {
      return false;
    }

   
    await tx.archivar(actual);
    await tx.marcarProduccion(candidato);
    await tx.incrementarPromociones();

    return true;
  });
}
