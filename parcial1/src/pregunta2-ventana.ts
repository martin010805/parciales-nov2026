export class VentanaDeMetricas {
  private readonly valores: number[];
  private readonly capacidad: number;

  public constructor(capacidad: number, iniciales: number[]) {
    if (!Number.isInteger(capacidad) || capacidad < 0) {
      throw new RangeError("La capacidad debe ser un entero no negativo");
    }
    if (!iniciales.every(Number.isFinite)) {
      throw new RangeError("Todas las métricas deben ser finitas");
    }
    if (iniciales.length > capacidad) {
      throw new RangeError("Los datos iniciales superan la capacidad");
    }

    this.capacidad = capacidad;
    this.valores = [...iniciales]; // copia defensiva
    this.checkRep();
  }

  private checkRep(): void {
    if (!Number.isInteger(this.capacidad) || this.capacidad < 0) {
      throw new Error("Invariante violado: capacidad inválida");
    }
    if (this.valores.length > this.capacidad) {
      throw new Error("Invariante violado: capacidad superada");
    }
    if (!this.valores.every(Number.isFinite)) {
      throw new Error("Invariante violado: valor no finito");
    }
  }

  public agregar(v: number): void {
    if (!Number.isFinite(v)) {
      throw new RangeError("La métrica debe ser finita");
    }
    if (this.capacidad === 0) {
      this.checkRep();
      return;
    }

    this.valores.push(v);
    if (this.valores.length > this.capacidad) {
      this.valores.shift();
    }
    this.checkRep();
  }

  public obtenerTodos(): readonly number[] {
    this.checkRep();
    return Object.freeze([...this.valores]);
  }

  public promedio(): number {
    this.checkRep();
    if (this.valores.length === 0) {
      throw new Error("No se puede calcular el promedio de una ventana vacía");
    }
    const suma = this.valores.reduce((a, b) => a + b, 0);
    const resultado = suma / this.valores.length;
    if (!Number.isFinite(resultado)) {
      throw new RangeError("El promedio no es representable como número finito");
    }
    return resultado;
  }
}
