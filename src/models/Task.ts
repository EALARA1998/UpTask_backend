// mongoose → Biblioteca para interactuar con MongoDB.
// Schema → Sirve para definir la forma que tendrán los documentos.
// Document → Representa un documento real dentro de la base de datos (añade campos como _id, createdAt, etc.).
// Types → Contiene tipos especiales como ObjectId, que se usa para relaciones entre colecciones.
import mongoose, { Schema, Document, Types } from "mongoose"
import Note from "./Note"

// Esto define un objeto de estados válidos para las tareas.
//   as const indica que cada valor debe ser tratado como un literal inmutable, no simplemente como un string.
// Sin as const, TypeScript pensaría que taskStatus.PENDING es de tipo string.
// Con as const, entiende que su valor exacto es "pending".
// Esto permite usar estos valores como tipos específicos más adelante.
// typeof taskStatus → obtiene el tipo del objeto taskStatus.
// keyof typeof taskStatus → obtiene las claves: "PENDING" | "ON_HOLD" | "IN_PROGRESS" | "UNDER_REVIEW" | "COMPLETED".
// typeof taskStatus[keyof typeof taskStatus] → obtiene los valores asociados a esas claves:
// "pending" | "onHold" | "inProgress" | "underReview" | "completed".
// TaskStatus es un tipo unión que solo acepta uno de esos strings.
const taskStatus = {
  PENDING: "pending",
  ON_HOLD: "onHold",
  IN_PROGRESS: "inProgress",
  UNDER_REVIEW: "underReview",
  COMPLETED: "completed",
} as const

export type TaskStatus = typeof taskStatus[keyof typeof taskStatus]
/*
  as const
  Esta parte es muy importante en TypeScript. Sin as const, el tipo de taskStatus.PENDING sería string, pero con as const:
  Se convierte en un tipo literal específico.
  taskStatus.PENDING no es solo string, sino exactamente "pending".
  Todo el objeto se vuelve readonly, así que no puedes cambiar los valores después.
 */

export interface ITask extends Document { // Al extender Document, la interfaz también incluye campos como _id, createdAt, updatedAt.
  name: string // Nombre de la tarea
  description: string // Descripción de la tarea
  project: Types.ObjectId // ID del proyecto al que pertenece la tarea
  status: TaskStatus // Estado actual de la tarea
  completedBy: {
    user: Types.ObjectId | null,
    status: TaskStatus
  }[]
  notes: Types.ObjectId[]
}

//https://mongoosejs.com/docs/schematypes.html
const TaskSchema: Schema = new Schema({
  name: {
    type: String,
    required: true, // Obligatorio
    trim: true // elimina espacios innecesarios.
  },
  description: {
    type: String,
    required: true, // Obligatorio
    trim: true // elimina espacios innecesarios.
  },
  project: {
    type: Types.ObjectId, // referencia a otro documento (un Project).
    // indica a Mongoose que este campo está vinculado al modelo Project.
    // Esto permite usar .populate("project") para traer el proyecto completo.
    ref: "Project",
  },
  status: {
    type: String,
    enum: Object.values(taskStatus), // solo puede tomar los valores definidos en taskStatus.
    default: taskStatus.PENDING // si no se especifica, la tarea comienza como "pending".
  },
  completedBy: [
    {
      user: {
        type: Types.ObjectId,
        ref: `User`,
        default: null
      },
      status: {
        type: String,
        enum: Object.values(taskStatus), // solo puede tomar los valores definidos en taskStatus.
        default: taskStatus.PENDING // si no se especifica, la tarea comienza como "pending".
      }
    }
  ],
  notes: [
    {
      type: Types.ObjectId,
      ref: `Note`
    }
  ]
}, { timestamps: true }) // Agrega automáticamente createdAt y updatedAt.

//Middleware
TaskSchema.pre('deleteOne', {document: true},async function () {
  const taskId = this._id
  if (!taskId) return
  await Note.deleteMany({task: taskId})
})


// Crea el modelo de datos basado en el esquema TaskSchema.
// Lo asocia con la colección "tasks" en MongoDB.
// El tipo <ITask> asegura que el modelo tenga autocompletado y validación en TypeScript.
const Task = mongoose.model<ITask>("Task", TaskSchema)
export default Task