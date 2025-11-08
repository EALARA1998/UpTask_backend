// Router → de Express, se usa para definir rutas modularmente.
import { Router } from "express";
// express-validator (body, param) → se usa para validar los datos del request (por ejemplo, que no falten campos o que los IDs sean válidos).
import { body, param } from "express-validator";
// ProjectController y TaskController → contienen la lógica de negocio (crear, editar, eliminar proyectos/tareas).
import { ProjectController } from "../controllers/ProjectController";
import { TaskController } from "../controllers/TaskController";
// projectExists, taskExist, taskBelongsToProject → middlewares que verifican la existencia de proyectos/tareas y sus relaciones.
import { projectExists } from "../middleware/project";
import { hasAuthorization, taskBelongsToProject, taskExist } from "../middleware/task";
// handleInputErrors → middleware personalizado que maneja los errores de validación.
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

// Crea un router modular de Express, donde se registrarán las rutas de proyectos y tareas.
const router = Router()

router.use(authenticate)

// Valida los campos requeridos del cuerpo (projectName, clientName, description).
// Si hay errores → handleInputErrors los captura y devuelve una respuesta con mensajes.
// Si todo está bien → ejecuta ProjectController.createProject.
router.post("/",
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripcion es obligatoria"),
  handleInputErrors,
  ProjectController.createProject
)

// Devuelve una lista de todos los proyectos.
router.get("/",
  ProjectController.getAllProjects
)

// Valida que el parámetro id sea un ObjectId válido de MongoDB.
// Llama al método getProjectById del controlador.
router.get("/:id",
  param("id")
    .isMongoId()
    .withMessage("ID no valido"),
  handleInputErrors,
  ProjectController.getProjectById
)

router.param("projectId", projectExists)

// Valida el id y los campos requeridos.
// Llama al método updateProject.
router.put("/:id",
  param("id")
    .isMongoId()
    .withMessage("ID no valido"),
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripcion es obligatoria"),
  handleInputErrors,
  ProjectController.updateProject
)

// Valida el id.
// Llama a deleteProject.
router.delete("/:id",
  param("id")
    .isMongoId()
    .withMessage("ID no valido"),
  handleInputErrors,
  ProjectController.deleteProject
)
  
/* Routes for Tasks */

// Antes de definirlas, se configuran middlewares automáticos con router.param:
// Cada vez que Express detecta una ruta que incluye :projectId o :taskId:
//   Ejecuta projectExists → busca el proyecto y lo adjunta en req.project.
//   Ejecuta taskExist → busca la tarea y la adjunta en req.task.
//   Ejecuta taskBelongsToProject → comprueba que la tarea pertenece al proyecto indicado.
// Esto ocurre automáticamente antes de entrar a los controladores.

router.param("taskId", taskExist)
router.param("taskId", taskBelongsToProject)

// Crea una tarea asociada al proyecto.
// Valida el ID del proyecto y los campos del cuerpo.
// Llama a TaskController.createTask.
router.post("/:projectId/tasks",
  hasAuthorization,
  param("projectId")
    .isMongoId()
    .withMessage("ID no valido"),
  body("name")
    .notEmpty()
    .withMessage("El nombre de la tarea es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripcion es obligatoria"),
  handleInputErrors,
  TaskController.createTask
)

// Obtiene todas las tareas relacionadas con ese proyecto.
router.get("/:projectId/tasks",
  param("projectId")
    .isMongoId()
    .withMessage("ID no valido"),
  handleInputErrors,
  TaskController.getProjectTasks
)

// Valida ambos IDs.
// Devuelve los datos de una tarea específica.
router.get("/:projectId/tasks/:taskId",
  param("projectId")
    .isMongoId()
    .withMessage("ID no valido"),
  param("taskId")
    .isMongoId()
    .withMessage("ID no valido"),
  handleInputErrors,
  TaskController.getTaskById
)

// Actualiza una tarea existente, validando IDs y campos.
router.put("/:projectId/tasks/:taskId",
  hasAuthorization,
  param("projectId")
    .isMongoId()
    .withMessage("ID no valido"),
  param("taskId")
    .isMongoId()
    .withMessage("ID no valido"),
  body("name")
    .notEmpty()
    .withMessage("El nombre de la tarea es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripcion es obligatoria"),
  handleInputErrors,
  TaskController.updateTask
)

// Elimina una tarea específica de un proyecto.
router.delete("/:projectId/tasks/:taskId",
  hasAuthorization,
  param("projectId")
    .isMongoId()
    .withMessage("ID no valido"),
  param("taskId")
    .isMongoId()
    .withMessage("ID no valido"),
  handleInputErrors,
  TaskController.deleteTask
)

// Sirve para cambiar el estado de la tarea (por ejemplo, pendiente → completada).
// Valida que status esté presente.
router.post("/:projectId/tasks/:taskId/status",
  param("projectId")
    .isMongoId()
    .withMessage("ID no valido"),
  param("taskId")
    .isMongoId()
    .withMessage("ID no valido"),
  body("status")
    .notEmpty()
    .withMessage("El estado es obligatorio"),
  handleInputErrors,
  TaskController.updateStatus
)
/* Team */
router.post(`/:projectId/team/find`,
  body(`email`)
    .isEmail().toLowerCase().withMessage(`E-mail no valido`),
  handleInputErrors,
  TeamMemberController.findMemberByEmail,
)

router.get(`/:projectId/team`,
  TeamMemberController.getProjectTeam,
)

router.post(`/:projectId/team`,
  body(`id`)
    .isMongoId()
    .withMessage("ID no valido"),
  handleInputErrors,
  TeamMemberController.addMemberById,
)

router.delete(`/:projectId/team/:userId`,
  param(`userId`)
    .isMongoId()
    .withMessage("ID no valido"),
  handleInputErrors,
  TeamMemberController.removeMemberById,
)

/* Note */
router.post(`/:projectId/tasks/:taskId/notes`,
  param("projectId")
    .isMongoId()
    .withMessage("ID no valido"),
  param("taskId")
    .isMongoId()
    .withMessage("ID no valido"),
  body(`content`)
    .notEmpty().withMessage(`El contenido de la nota es obligatoria`),
  handleInputErrors,
  NoteController.createNote
)

router.get(`/:projectId/tasks/:taskId/notes`,
  param("projectId")
    .isMongoId()
    .withMessage("ID no valido"),
  param("taskId")
    .isMongoId()
    .withMessage("ID no valido"),
  handleInputErrors,
  NoteController.getTaskNotes
)

router.delete("/:projectId/tasks/:taskId/notes/:noteId",
  param("noteId").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  NoteController.deleteNote
)

export default router