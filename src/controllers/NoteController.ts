import type { Request, Response } from "express";
import Note, { INote } from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
  projectId: string;
  taskId: string;
  noteId: string;
}

export class NoteController {
  static createNote = async (req: Request<{},{},INote>, res: Response) => {
    const { content } = req.body
    const note = new Note()
    note.content = content
    note.createdBy = req.user?.id
    note.task = req.task.id
    req.task.notes.push(note.id)
    try {
      await Promise.allSettled([req.task.save(), note.save()])
      res.send(`Nota creada correctamente`)
    } catch (error) {
      res.status(500).json({error: `Hubo un error`})
    }
  }
  static getTaskNotes = async (req: Request<{},{},INote>, res: Response) => {
    try {
      const notes = await Note.find({task: req.task.id}).populate({path: "task"})
      res.json(notes)
    } catch (error) {
      res.status(500).json({error: `Hubo un error`})
    }
  }
  static deleteNote = async (req: Request<NoteParams>, res: Response) => {
    const { noteId } = req.params
    const noteObjectId = new Types.ObjectId(noteId)
    const note = await Note.findById(noteObjectId)
    if (!note) {
      const error = new Error('Nota no encontrada')
      return res.status(404).json({error: error.message})
    }
    if (note.createdBy.toString() !== req.user?.id.toString()) {
      const error = new Error(`Accion no valida`)
      return res.status(404).json({error: error.message})
    }
    req.task.notes = req.task.notes.filter( note => note.toString() !== noteId.toString())
    try {
      await Promise.allSettled([note.deleteOne(), note.deleteOne()])
      res.send('Nota eliminada')
    } catch (error) {
      res.status(500).json({error: 'Hubo un error'})
    }
  }
}