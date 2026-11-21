from dataclasses import dataclass
from contextlib import contextmanager
from copy import deepcopy
import unittest

@dataclass(frozen=True)
class Model:
    id: str
    auc_registrado: float = 0.0

class ConflictoVersion(Exception):
    pass

class Registro:
    """Simulador secuencial, no reemplaza una BD transaccional."""
    def __init__(self, activo=None):
        self.activo = activo
        self.resultados = {}
        self.cambios = 0
        self.fallar = False

    @contextmanager
    def transaccion(self):
        respaldo = (self.activo, deepcopy(self.resultados), self.cambios)
        try:
            yield
        except Exception:
            self.activo, self.resultados, self.cambios = respaldo
            raise

    def cambiar_activo(self, esperado, nuevo):
        if self.activo != esperado:
            raise ConflictoVersion('Cambió el campeón')
        if self.fallar:
            raise IOError('Fallo simulado antes de confirmar')
        self.activo = nuevo
        self.cambios += 1

def promover(candidato, campeon, datos_validacion, registro, clave, evaluar):
    with registro.transaccion():
        if clave in registro.resultados:
            return registro.resultados[clave]
        esperado = campeon.id if campeon else None
        if registro.activo != esperado:
            raise ConflictoVersion('Campeón desactualizado')
        mc = evaluar(candidato, datos_validacion)
        if campeon is None:
            aprobado = mc['auc'] >= 0.80 and mc['recall'] >= 0.90
        else:
            ma = evaluar(campeon, datos_validacion)
            aprobado = (mc['auc'] > ma['auc'] + 0.01
                        and mc['recall'] >= 0.90
                        and mc['recall'] >= ma['recall'])
        if aprobado:
            registro.cambiar_activo(esperado, candidato.id)
        registro.resultados[clave] = aprobado
        return aprobado

class PruebasPromocion(unittest.TestCase):
    def setUp(self):
        self.c = Model('C', 0.70)
        self.x = Model('X')
        self.r = Registro('C')
        self.lote = object()

    def test_comparacion_mismo_lote(self):
        vistos = []
        def evaluar(m, lote):
            vistos.append((m.id, lote))
            return {'auc': 0.92 if m.id == 'X' else 0.93,
                    'recall': 0.95}
        self.assertFalse(promover(self.x, self.c, self.lote,
                                 self.r, 'k1', evaluar))
        self.assertEqual(vistos, [('X', self.lote), ('C', self.lote)])

    def test_idempotencia_y_version(self):
        ev = lambda m, l: {'auc': 0.92 if m.id == 'X' else 0.90,
                           'recall': 0.95}
        self.assertTrue(promover(self.x, self.c, self.lote, self.r, 'k2', ev))
        self.assertTrue(promover(self.x, self.c, self.lote, self.r, 'k2', ev))
        self.assertEqual(self.r.cambios, 1)
        with self.assertRaises(ConflictoVersion):
            promover(Model('Y'), self.c, self.lote, self.r, 'k3', ev)

    def test_rollback_fallo(self):
        self.r.fallar = True
        ev = lambda m, l: {'auc': 0.92 if m.id == 'X' else 0.90,
                           'recall': 0.95}
        with self.assertRaises(IOError):
            promover(self.x, self.c, self.lote, self.r, 'k4', ev)
        self.assertEqual(self.r.activo, 'C')
        self.assertEqual(self.r.cambios, 0)
        self.assertNotIn('k4', self.r.resultados)

    def test_rechazo_por_recall(self):
        ev = lambda m, l: {'auc': 0.92 if m.id == 'X' else 0.90,
                           'recall': 0.60 if m.id == 'X' else 0.90}
        self.assertFalse(promover(self.x, self.c, self.lote,
                                 self.r, 'k5', ev))
        self.assertEqual(self.r.activo, 'C')

if __name__ == '__main__':
    unittest.main()
