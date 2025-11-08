// mongoose → Biblioteca para manejar la conexión y modelos en MongoDB.
// Schema → Sirve para definir la estructura (campos, tipos, validaciones) de un documento.
// Document → Tipo base que representa un documento de MongoDB dentro de Mongoose.
// PopulatedDoc → Tipo de TypeScript que indica que un campo puede contener una referencia a otro documento (por ejemplo, una relación con Task).
// Types → Contiene tipos especiales de MongoDB, como ObjectId.
import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose"
// ITask → Es la interfaz que representa una tarea (Task), importada desde otro modelo.
import Task, { ITask } from "./Task"
import { IUser } from "./User"
import Note from "./Note"

export interface IProject extends Document {
  projectName: string // Nombre del proyecto
  clientName: string // Nombre del cliente
  description: string // Descripción del proyecto
  // Usamos PopulatedDoc<ITask & Document>[] porque posiblemente vas a hacer populate("tasks") para reemplazar los ObjectId por los documentos completos de tipo ITask.
  tasks: PopulatedDoc<ITask & Document>[] // Lista de tareas asociadas al proyecto (referencias a documentos Task) // Al extender de Document, también incluye propiedades internas de MongoDB como _id, createdAt, updatedAt, etc.
  manager: PopulatedDoc<IUser & Document>
  team: PopulatedDoc<IUser & Document>[]
}

//https://mongoosejs.com/docs/schematypes.html
// type: String → debe ser texto.
// required: true → obligatorio.
// trim: true → elimina espacios al inicio y final del texto.
const ProjectSchema: Schema = new Schema({
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  tasks: [ // Es un array ([]).
    {
      type: Types.ObjectId, // Cada elemento es de tipo ObjectId (identificador único de MongoDB).
      // indica que esos IDs hacen referencia al modelo Task (crea una relación entre Project y Task).
      // Esto permite luego usar .populate('tasks') para traer los datos completos de las tareas.
      ref: "Task"
    }
  ],
  manager:
  {
    type: Types.ObjectId, // Cada elemento es de tipo ObjectId (identificador único de MongoDB).
    // indica que esos IDs hacen referencia al modelo Task (crea una relación entre Project y Task).
    // Esto permite luego usar .populate('tasks') para traer los datos completos de las tareas.
    ref: "User"
  },
  team: [ // Es un array ([]).
    {
      type: Types.ObjectId, // Cada elemento es de tipo ObjectId (identificador único de MongoDB).
      // indica que esos IDs hacen referencia al modelo Task (crea una relación entre Project y Task).
      // Esto permite luego usar .populate('tasks') para traer los datos completos de las tareas.
      ref: "User"
    }
  ],
  // Hace que MongoDB agregue automáticamente los campos:
  //   createdAt: Date,
  //   updatedAt: Date
}, { timestamps: true })

//Middleware
ProjectSchema.pre('deleteOne', {document: true},async function () {
  const projectId = this._id
  if (!projectId) return
  const tasks = await Task.find({project: projectId})
  for (const task of tasks) {
    await Note.deleteMany({task: task._id})
  }
  await Task.deleteMany({project: projectId})
})

// crea el modelo a partir del esquema.
// El primer parámetro "Project" es el nombre de la colección (Mongoose lo pluraliza: guardará los documentos en projects).
// El segundo es el esquema (ProjectSchema).
// Se le pasa el tipo genérico <IProject> para que tenga autocompletado en TypeScript.
const Project = mongoose.model<IProject>("Project", ProjectSchema)

export default Project