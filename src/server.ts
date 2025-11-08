// Es el framework de Node.js que se usa para crear servidores web y APIs de forma sencilla.
import express from "express"
// Sirve para cargar variables de entorno desde un archivo .env (como contraseñas, URLs, claves, etc.).
import dotenv from "dotenv"
// Es una función (definida en ./config/db.js) que probablemente conecta tu app a una base de datos
import { connectDB } from "./config/db"

import authRoutes from "./routes/authRoutes"

// Es un módulo que contiene las rutas relacionadas con “projects”, es decir, endpoints como GET /api/projects, POST /api/projects, etc.
import projectRoutes from "./routes/projectRoutes"
// Se importa la configuración de CORS desde el archivo cors.ts
import { corsConfig } from "./config/cors"
// Middleware que permite controlar quién puede acceder a tu API desde otros dominios (Cross-Origin Resource Sharing).
import cors from "cors"
// Esto importa el módulo morgan, que es un middleware de Node.js (para Express) usado para registrar solicitudes HTTP (logs).
// Morgan te muestra información de cada petición que recibe tu servidor: método, ruta, estado, tiempo de respuesta, etc.
import morgan from "morgan"

// Esto busca un archivo .env en la raíz del proyecto y carga sus variables en process.env.
// Ejemplo: si en .env tienes:
//   PORT=4000
//   DB_URI=mongodb://localhost:27017/midb
// podrás acceder a ellas en el código como process.env.PORT o process.env.DB_URI.
dotenv.config()

// Llama a la función que se encarga de establecer la conexión con la base de datos.
connectDB()

// Crea una instancia de la aplicación Express, que es el servidor en sí.
// A partir de aquí, app se usa para configurar middlewares, rutas y escuchar peticiones.
const app = express()

// Aquí se aplica el middleware de CORS a la aplicación Express, usando la configuración importada desde cors.ts.
app.use(cors(corsConfig))

// Aquí le dices a tu aplicación Express (app) que use Morgan como middleware.
// El argumento 'dev' es uno de los formatos predefinidos que trae Morgan.
app.use(morgan(`dev`))

// Este middleware permite que tu servidor pueda interpretar el cuerpo (body) de las peticiones HTTP que vengan en formato JSON.
// Sin esto, si haces un POST con un JSON, Express no podrá leerlo correctamente.
app.use(express.json()) // Para que pueda leer jsons.

app.use("/api/auth", authRoutes)
// Esto registra todas las rutas definidas en projectRoutes, pero les añade el prefijo /api/projects.
// Ejemplo:
//   Si en projectRoutes tienes una ruta router.get("/"), en realidad será accesible en
//     GET /api/projects/
//   Si tienes router.post("/new"), será
//     POST /api/projects/new
app.use("/api/projects", projectRoutes)

export default app