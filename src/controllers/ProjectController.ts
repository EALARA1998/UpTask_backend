// Request y Response → se importan de Express y sirven para tipar los parámetros de las funciones.
import type { Request, Response } from "express";
// Project → es el modelo de Mongoose que representa la colección projects en MongoDB.
import Project from "../models/Project";
import { populate } from "dotenv";

// Aquí se define una clase con métodos estáticos (static), lo que significa que no necesitas crear una instancia del controlador.
// Puedes usar los métodos directamente:
export class ProjectController {

  static createProject = async (req: Request, res: Response) => {
    // Crea una nueva instancia de Project con los datos que vienen en req.body.
    const project = new Project(req.body)
    project.manager = req.user?.id
    try {
      // Guarda el proyecto en MongoDB con .save().
      await project.save()
      // await Project.create(req.body) Alternativa a project.save()
      // Si todo sale bien → responde con "Proyecto creado correctamente".
      res.send("Proyecto creado correctamente")
    } catch (error) {
      // Si ocurre un error → devuelve un error 500 (Error interno).
      res.status(500).json({error: 'Hubo un error'})
    }
  }

  static getAllProjects = async (req: Request, res: Response) => {
    try {
      // Busca todos los proyectos en la base de datos con Project.find({}).
      const projects = await Project.find({
        $or: [
          {manager: {$in: req.user?.id}},
          {team: {$in: req.user?.id}}
        ]
      })
      // Devuelve la lista en formato JSON.
      res.json(projects)
    } catch (error) {
      // Si algo falla → responde con error 500.
      res.status(500).json({error: 'Hubo un error'})
    }
  }

  static getProjectById = async (req: Request, res: Response) => {
    // Obtiene el parámetro id de la URL (/projects/:id).
    const { id } = req.params
    try {
      // Busca el proyecto por su _id con Project.findById(id).
      // .populate("tasks") → llena el campo tasks con los datos de las tareas relacionadas (esto viene de una referencia en el modelo de Mongoose).
      const project = await Project.findById(id).populate({path: "tasks", populate: [
        {
          path: `completedBy.user`,
          select: "_id name email"
        },
        {
          path: `notes`,
          populate: {
            path: "createdBy"
          }
        }
      ]})
      // Si no existe, responde con 404 Proyecto no encontrado.
      if (!project) {
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({ error: error.message })
      }
      if (project.manager?.toString() !== req.user?.id.toString() && !project.team.includes(req.user?.id)) {
        const error = new Error(`Accion no valida`)
        return res.status(404).json({error: error.message})
      }
      // Si existe, devuelve el proyecto completo en JSON.
      res.json(project)
    } catch (error) {
      // Si algo falla → responde con error 500.
      res.status(500).json({error: 'Hubo un error'})
    }
  }

  static updateProject = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
      // Busca el proyecto por su id.
      const project = await Project.findById(id)
      // Si no lo encuentra → devuelve 404.
      if (!project) {
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({ error: error.message })
      }
      if (project.manager?.toString() !== req.user?.id.toString()) {
        const error = new Error(`Solo el Manager puede actualizar un Proyecto`)
        return res.status(404).json({error: error.message})
      }
      // Si lo encuentra, actualiza los campos (clientName, projectName, description) con los nuevos datos del req.body.
      project.clientName = req.body.clientName
      project.projectName = req.body.projectName
      project.description = req.body.description
      // Guarda los cambios con .save().
      await project.save()
      // Responde con "Proyecto actualizado".
      res.send("Proyecto actualizado")
    } catch (error) {
      // Si algo falla → responde con error 500.
      res.status(500).json({error: 'Hubo un error'})
    }
    // Otra alternativa sería usar Project.findByIdAndUpdate(id, req.body) — pero esta forma manual permite validar campos antes de guardar.
  }

  static deleteProject = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
      // Busca el proyecto por su id.
      const project = await Project.findById(id)
      // Si no lo encuentra → responde con 404.
      if (!project) {
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({ error: error.message })
      }
      if (project.manager?.toString() !== req.user?.id.toString()) {
        const error = new Error(`Solo el Manager puede eliminar un proyecto`)
        return res.status(404).json({error: error.message})
      }
      // Si lo encuentra → elimina el documento de MongoDB con .deleteOne().
      await project.deleteOne()
      // Devuelve "Proyecto eliminado" si todo sale bien.
      res.send("Proyecto eliminado")
    } catch (error) {
      // Si algo falla → responde con error 500.
      res.status(500).json({error: 'Hubo un error'})
    }
  }
}