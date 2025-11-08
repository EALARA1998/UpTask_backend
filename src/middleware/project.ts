// Tipos de Express para manejar middlewares y rutas.
import type { NextFunction, Request, Response } from "express";
// Modelo y tipo de un proyecto en MongoDB/TypeScript.
import Project, { IProject } from "../models/Project";

// Aquí le estamos diciendo a TypeScript que añadimos un nuevo campo project al objeto req.
// Esto permite que después en cualquier ruta, cuando uses req.project, TypeScript sepa que es un IProject y no marque error de tipo.
// Es una técnica común para middlewares que agregan información a req.
declare global {
  namespace Express {
    interface Request {
      project: IProject
    }
  }
}

// Es un middleware asíncrono, que se ejecuta antes de la ruta principal.
// req → petición
// res → respuesta
// next → función que se llama para continuar al siguiente middleware o controlador.
export async function projectExists(req: Request, res: Response, next: NextFunction) {
  try {
    // Espera que la ruta tenga un parámetro :projectId.
    const { projectId } = req.params
    // Usa Mongoose para buscar un proyecto por su _id.
    // Retorna null si no existe.
    const project = await Project.findById(projectId)
    // Si project es null, devuelve un error 404 y termina la petición.
    // return evita que se ejecute next() después.
    if (!project) {
      const error = new Error("Proyecto no encontrado")
      return res.status(404).json({ error: error.message })
    }
    // Aquí asignamos el proyecto encontrado a req.project para que las rutas posteriores puedan usarlo sin hacer otra consulta a la base de datos.
    // Gracias a la extensión de la interfaz Request, TypeScript sabe que req.project es un IProject.
    req.project = project
    // Si todo está bien, llama al siguiente middleware o controlador de la ruta.
    next()
  } catch (error) {
    // Si ocurre cualquier otro error (por ejemplo, error de conexión a MongoDB), devuelve un error 500.
    res.status(500).json({ error: "Hubo un error"})
  }
}