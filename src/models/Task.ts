import mongoose, { Schema, Document, Types } from "mongoose"

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

export interface ITask extends Document {
  name: string
  description: string
  project: Types.ObjectId
  status: TaskStatus
}

//https://mongoosejs.com/docs/schematypes.html
const TaskSchema: Schema = new Schema({
  name: {
    type: String,
    require: true,
    trim: true
  },
  description: {
    type: String,
    require: true,
    trim: true
  },
  project: {
    type: Types.ObjectId,
    ref: "Project",
  },
  status: {
    type: String,
    enum: Object.values(taskStatus),
    default: taskStatus.PENDING
  }
}, { timestamps: true }) // Para que se añada la info de la fecha en que se añadio y actualizo.
const Task = mongoose.model<ITask>("Task", TaskSchema)
export default Task