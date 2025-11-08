// Importa los tipos de Express (Request, Response, NextFunction) para tener tipado en TypeScript.
import type { NextFunction, Request, Response } from "express";
// Importa el modelo Task y su interfaz ITask desde el archivo models/Task, que probablemente es un modelo de Mongoose.
import Task, { ITask } from "../models/Task";

// Esto extiende la interfaz Request de Express para agregar una nueva propiedad llamada task.
// Así, más adelante puedes usar req.task sin que TypeScript marque error, porque ya está declarada.
declare global {
  namespace Express {
    interface Request {
      task: ITask
    }
  }
}

export async function taskExist(req: Request, res: Response, next: NextFunction) {
  try {
    // Obtiene taskId de los parámetros de la URL (req.params).
    const { taskId } = req.params
    // Busca la tarea en la base de datos usando Mongoose: Task.findById(taskId).
    const task = await Task.findById(taskId)
    // Si no existe la tarea, responde con error 404 y mensaje "Tarea no encontrada".
    if (!task) {
      const error = new Error("Tarea no encontrada")
      return res.status(404).json({ error: error.message })
    }
    // Si sí existe, la guarda en req.task para que los siguientes middlewares o controladores la usen.
    req.task = task
    // Luego llama a next() para pasar al siguiente middleware.
    next()
  } catch (error) {
    // Si ocurre un error inesperado (problemas con la DB, por ejemplo), devuelve un 500.
    res.status(500).json({ error: "Hubo un error"})
  }
}

export async function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
  try {
    // Compara si la tarea (req.task.project) pertenece realmente al proyecto (req.project).
    if (req.task.project.toString() !== req.project.id.toString()) {
      // Si no coinciden, devuelve un error 400 con mensaje "Accion no valida".
      const error = new Error("Accion no valida")
      return res.status(400).json({error: error.message})
    }
    // Si sí coinciden, llama a next() para continuar.
    next()
  } catch (error) {
    // Si ocurre un error inesperado (problemas con la DB, por ejemplo), devuelve un 500.
    res.status(500).json({ error: "Hubo un error"})
  }
}

export async function hasAuthorization(req: Request, res: Response, next: NextFunction) {
  try {
    // Compara si la tarea (req.task.project) pertenece realmente al proyecto (req.project).
    if (req.user?.id.toString() !== req.project.manager?.toString()) {
      // Si no coinciden, devuelve un error 400 con mensaje "Accion no valida".
      const error = new Error("Accion no valida")
      return res.status(400).json({error: error.message})
    }
    // Si sí coinciden, llama a next() para continuar.
    next()
  } catch (error) {
    // Si ocurre un error inesperado (problemas con la DB, por ejemplo), devuelve un 500.
    res.status(500).json({ error: "Hubo un error"})
  }
}