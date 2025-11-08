// Request, Response, NextFunction: tipos de Express para darle tipado correcto al middleware (esto ayuda a TypeScript a saber qué tipo de objetos estás usando).
import type { Request, Response, NextFunction } from "express"
// validationResult: función de express-validator que recoge los resultados de las validaciones previas hechas con body(), param(), etc.
import { validationResult } from "express-validator"

export const handleInputErrors = (req: Request, res: Response, next: NextFunction) => {
  // Llama a validationResult(req), que revisa todas las validaciones ejecutadas antes en la misma ruta.
  //   Ejemplo: body("name").notEmpty().withMessage("El nombre es obligatorio").
  //   Si el campo no cumple la validación, express-validator guarda ese error internamente.
  // Guarda el resultado en errors.
  let errors = validationResult(req)
  // Usa errors.isEmpty() para saber si hubo errores o no:
  //   Si no hay errores, llama a next() → continúa al siguiente middleware o controlador.
  //   Si hay errores, devuelve una respuesta HTTP 400 (Bad Request) con los errores en formato JSON:
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}