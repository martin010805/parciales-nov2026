
import unittest
from dataclasses import dataclass


@dataclass
class Model:
    id: str
    auc_registrado: float = 0.0


class Registro:
    def __init__(self, active='C', fail_on=None):
        self.active = active
        self.log = []
        self.fail_on = fail_on

    def marcar(self, model_id, stage):
        if self.fail_on == (model_id, stage):
            raise IOError('Falla de escritura')

        self.log.append((model_id, stage))

        if stage == 'Archived' and self.active == model_id:
            self.active = None

        if stage == 'Production':
            self.active = model_id


# Reproduccion de la logica original del enunciado.
# Se inyectan las dependencias para facilitar las pruebas.
def original(candidato, campeon, datos_validacion, registro, evaluar):
    if campeon is None:
        registro.marcar(candidato.id, 'Production')
        return True

    auc_candidato = evaluar(candidato, datos_validacion)

    if auc_candidato > campeon.auc_registrado + 0.01:
        registro.marcar(campeon.id, 'Archived')
        registro.marcar(candidato.id, 'Production')
        return True

    return False


class Regression(unittest.TestCase):

    def setUp(self):
        self.c = Model('C', 0.70)
        self.x = Model('X')
        self.r = Registro()
        self.lote = object()

    # Prueba 1: comparacion con el mismo lote
    def test_mismo_lote(self):
        vistos = []

        def ev(modelo, lote):
            vistos.append((modelo.id, lote))
            return 0.92 if modelo.id == 'X' else 0.93

        original(
            self.x, self.c, self.lote, self.r, ev
        )

        # Ambos modelos deberian evaluarse con el mismo lote.
        self.assertEqual(
            vistos,
            [('X', self.lote), ('C', self.lote)]
        )

    # Prueba 2: idempotencia
    def test_idempotencia(self):
        ev = lambda modelo, lote: 0.92

        original(
            self.x, self.c, self.lote, self.r, ev
        )

        original(
            self.x, self.c, self.lote, self.r, ev
        )

        # Repetir la operacion no deberia generar cambios extra.
        self.assertEqual(
            self.r.log,
            [('C', 'Archived'), ('X', 'Production')]
        )

    # Prueba 3: rollback ante fallos
    def test_rollback(self):
        self.r.fail_on = ('X', 'Production')

        with self.assertRaises(IOError):
            original(
                self.x,
                self.c,
                self.lote,
                self.r,
                lambda modelo, lote: 0.92
            )

        # Si falla la promocion, el campeon debe seguir activo.
        self.assertEqual(self.r.active, 'C')

    # Prueba 4: proteccion del recall minoritario
    def test_recall(self):
        metricas = {
            'X': {
                'auc': 0.92,
                'recall': 0.60
            },
            'C': {
                'auc': 0.90,
                'recall': 0.90
            }
        }

        def ev(modelo, lote):
            return metricas[modelo.id]['auc']

        approved = original(
            self.x,
            self.c,
            self.lote,
            self.r,
            ev
        )

        # El candidato mejora el AUC, pero empeora el recall.
        # La version original ignora este deterioro.
        self.assertFalse(approved)


if __name__ == '__main__':
    unittest.main()
