
export class RangoInvalido extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RangoInvalido";
  }
}

export function debePromover(
  candidato: number,
  campeon: number | null,
  margen: number
): boolean {
  // Comprobamos que los valores sean válidos
  if (!Number.isFinite(candidato)) {
    throw new RangoInvalido("El candidato debe ser finito");
  }

  if (campeon !== null && !Number.isFinite(campeon)) {
    throw new RangoInvalido("El campeón debe ser finito");
  }

  if (!Number.isFinite(margen) || margen < 0) {
    throw new RangoInvalido("El margen debe ser finito y no negativo");
  }

  // Si no existe un campeón, el candidato puede promocionar
  if (campeon === null) {
    return true;
  }

  // Debe superar estrictamente al campeón más el margen
  return candidato > campeon + margen;
}

// Pruebas de funcionamiento
const casos = [
  { candidato: 0.8, campeon: null, margen: 0.01, esperado: true },
  { candidato: 0.9, campeon: 0.8, margen: 0.05, esperado: true },
  { candidato: 0.85, campeon: 0.8, margen: 0.05, esperado: false },
  { candidato: 0.84, campeon: 0.8, margen: 0.05, esperado: false },
  { candidato: 0.81, campeon: 0.8, margen: 0, esperado: true },
  { candidato: 0.8, campeon: 0.8, margen: 0, esperado: false },
  { candidato: -0.2, campeon: -0.5, margen: 0.1, esperado: true },
  { candidato: 0, campeon: 0, margen: 0, esperado: false },
  { candidato: 0.3, campeon: 0.2, margen: 0.1, esperado: false },
] satisfies Array<{
  candidato: number;
  campeon: number | null;
  margen: number;
  esperado: boolean;
}>;

for (const caso of casos) {
  const resultado = debePromover(
    caso.candidato,
    caso.campeon,
    caso.margen
  );

  if (resultado !== caso.esperado) {
    throw new Error(
      `Error en la prueba: ${JSON.stringify(caso)}`
    );
  }
}

// Pruebas con valores inválidos
const casosInvalidos: Array<{
  candidato: number;
  campeon: number | null;
  margen: number;
}> = [
  { candidato: NaN, campeon: 0.8, margen: 0.05 },
  { candidato: Infinity, campeon: 0.8, margen: 0.05 },
  { candidato: -Infinity, campeon: 0.8, margen: 0.05 },
  { candidato: 0.9, campeon: NaN, margen: 0.05 },
  { candidato: 0.9, campeon: Infinity, margen: 0.05 },
  { candidato: 0.9, campeon: 0.8, margen: -0.1 },
  { candidato: 0.9, campeon: 0.8, margen: Infinity },
  { candidato: 0.9, campeon: 0.8, margen: NaN },
];

for (const caso of casosInvalidos) {
  let errorDetectado = false;

  try {
    debePromover(
      caso.candidato,
      caso.campeon,
      caso.margen
    );
  } catch (error) {
    errorDetectado = error instanceof RangoInvalido;
  }

  if (!errorDetectado) {
    throw new Error(
      "La función debía rechazar un valor inválido"
    );
  }
}

console.log("Todas las pruebas finalizaron correctamente");
