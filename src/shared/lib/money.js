// Para inputs de montos en pesos colombianos: el usuario escribe solo
// dígitos, pero los ve agrupados con punto de miles mientras escribe
// (ej. "21.435.678") — un <input type="number"> nativo no puede mostrar esa
// agrupación, por eso estos campos usan type="text" con este par de helpers.
export function formatAmountInput(digitsOnly) {
  if (!digitsOnly) return ''
  return Number(digitsOnly).toLocaleString('es-CO')
}

export function parseAmountInput(displayValue) {
  return displayValue.replace(/\D/g, '')
}
