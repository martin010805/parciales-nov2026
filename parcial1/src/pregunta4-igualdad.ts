
export class Metrica {
  public constructor(
    public readonly nombre: string,
    public readonly valor: number
  ) {}

  public equalValue(that: Metrica): boolean {
    if (this.constructor !== that.constructor) {
      return false;
    }

    return (
      this.nombre === that.nombre &&
      Object.is(this.valor, that.valor)
    );
  }
}

export class MetricaConUmbral extends Metrica {
  public constructor(
    nombre: string,
    valor: number,
    public readonly umbral: number
  ) {
    super(nombre, valor);
  }

  public override equalValue(that: Metrica): boolean {
    if (this.constructor !== that.constructor) {
      return false;
    }

    if (!(that instanceof MetricaConUmbral)) {
      return false;
    }

    return (
      super.equalValue(that) &&
      Object.is(this.umbral, that.umbral)
    );
  }
}

const a = new Metrica("rmse", 0.15);
const b = new Metrica("rmse", 0.15);
const c = new Metrica("rmse", 0.20);

const d = new MetricaConUmbral("rmse", 0.15, 0.20);
const e = new MetricaConUmbral("rmse", 0.15, 0.20);
const f = new MetricaConUmbral("rmse", 0.15, 0.30);

function comprobar(
  condicion: boolean,
  mensaje: string
): void {
  if (!condicion) {
    throw new Error(mensaje);
  }
}

comprobar(a.equalValue(b), "Falló igualdad básica");
comprobar(d.equalValue(e), "Falló igualdad con umbral");

comprobar(!a.equalValue(c), "Falló diferencia de valores");
comprobar(!d.equalValue(f), "Falló diferencia de umbrales");

comprobar(
  a.equalValue(d) === d.equalValue(a),
  "Falló la simetría"
);

comprobar(!a.equalValue(d), "No deben ser iguales");
comprobar(!d.equalValue(a), "No deben ser iguales");

const nan1 = new Metrica("rmse", NaN);
const nan2 = new Metrica("rmse", NaN);

comprobar(
  nan1.equalValue(nan2),
  "Falló la comparación con NaN"
);

console.log("Todas las pruebas de igualdad pasaron");

