import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import { taskBelongsToProject, taskExist } from "../middleware/task";

const router = Router()

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
router.get("/", ProjectController.getAllProjects)

router.get("/:id",
  param("id")
    .isMongoId()
    .withMessage("ID no valido"),
  handleInputErrors,
  ProjectController.getProjectById
)

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

router.delete("/:id",
  param("id")
    .isMongoId()
    .withMessage("ID no valido"),
    handleInputErrors,
    ProjectController.deleteProject
  )
  
  /* Routes for Tasks */

router.param("projectId", projectExists)
router.param("taskId", taskExist)
router.param("taskId", taskBelongsToProject)

router.post("/:projectId/tasks",
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

router.get("/:projectId/tasks",
  param("projectId")
    .isMongoId()
    .withMessage("ID no valido"),
  handleInputErrors,
  TaskController.getProjectTasks
)

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

router.put("/:projectId/tasks/:taskId",
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

router.delete("/:projectId/tasks/:taskId",
  param("projectId")
    .isMongoId()
    .withMessage("ID no valido"),
  param("taskId")
    .isMongoId()
    .withMessage("ID no valido"),
  handleInputErrors,
  TaskController.deleteTask
)

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


export default router