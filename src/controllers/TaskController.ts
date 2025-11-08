// Request y Response: tipos de Express para tipar correctamente las funciones del controlador.
import type { Request, Response } from "express";
// Task: es el modelo de Mongoose que representa una tarea (documento en la colección tasks).
import Task from "../models/Task";
import mongoose from "mongoose";

// Aquí se agrupan todos los métodos relacionados con las tareas.
// Cada método es estático, por lo que no necesitas crear una instancia de la clase para usarlos.
//   Por ejemplo:
//   router.post("/:projectId/tasks", TaskController.createTask)
export class TaskController {

  static createTask = async (req: Request, res: Response) => {
    try {
      // Crea una nueva tarea a partir del cuerpo del request (req.body).
      const task = new Task(req.body)
      // Asocia la tarea al proyecto actual:
      // task.project = req.project.id
      // (Este req.project fue agregado previamente por el middleware projectExists.)
      task.project = req.project.id
      // Agrega la referencia de la tarea al arreglo tasks del proyecto:
      req.project.tasks.push(task.id)
      // Guarda ambos documentos (la tarea y el proyecto actualizado) al mismo tiempo usando:
      // Promise.allSettled ejecuta ambas promesas en paralelo y no falla si una da error (a diferencia de Promise.all).
      await Promise.allSettled([task.save(), req.project.save()])
      // Envía el mensaje: "Tarea creada correctamente".
      res.send("Tarea creada correctamente")
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' })
    }
  }

  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      // Busca todas las tareas que pertenecen al proyecto actual (req.project.id).
      // Usa .populate("project") para traer también los datos del proyecto (no solo el ID).
      const tasks = await Task.find({ project: req.project.id }).populate("project")
      // Devuelve la lista de tareas en formato JSON.
      res.json(tasks)
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' })
    }
  }

  static getTaskById = async (req: Request, res: Response) => {
    try {
      const task = await Task.findById(req.task.id)
        .populate({ path: 'completedBy.user', select: '_id name email' })
        .populate({ path: 'notes', populate: {path: 'createdBy', select: '_id name email'}})
      res.json(task)
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' })
    }
  }

  static updateTask = async (req: Request, res: Response) => {
    try {
      // Actualiza los campos name y description de la tarea.
      req.task.name = req.body.name
      req.task.description = req.body.description
      // Guarda los cambios con .save().
      await req.task.save()
      // Devuelve "Tarea actualizada correctamente".
      res.send("Tarea actualizada correctamente")
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' })
    }
    // Como req.task viene directamente de la base de datos (por taskExist), solo hace falta modificar los valores y guardarlos.
  }

  static deleteTask = async (req: Request, res: Response) => {
    try {
      // Elimina la referencia de la tarea dentro del arreglo req.project.tasks:
      // Esto evita que el proyecto tenga referencias a tareas eliminadas.
      req.project.tasks = req.project.tasks.filter(task => task?.toString() !== req.task.id.toString())
      // Elimina la tarea de la colección tasks con req.task.deleteOne().
      // Guarda el proyecto actualizado.
      // Usa Promise.allSettled() para ejecutar ambas operaciones en paralelo.
      await Promise.allSettled([req.task.deleteOne(), req.project.save()])
      // Devuelve "Tarea eliminada correctamente".
      res.send("Tarea Eliminada Correctamente")
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' })
    }
  }

  static updateStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body
        req.task.status = status
        const data = {
          user: new mongoose.Types.ObjectId(req.user?.id),
          status
        }
        req.task.completedBy.push(data)
        await req.task.save()
        res.send('Tarea Actualizada')
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
  }
}