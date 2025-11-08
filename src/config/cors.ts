// Se importa el tipo CorsOptions del paquete cors.
// Esto sirve para indicar a TypeScript que el objeto corsConfig debe cumplir con la estructura esperada por el middleware cors.
import { CorsOptions } from "cors";

// Se exporta una constante llamada corsConfig que tiene el tipo CorsOptions. Este objeto se usa luego en Express así:
// import cors from "cors";
// import express from "express";
// import { corsConfig } from "./config/corsConfig";
// const app = express();
// app.use(cors(corsConfig));
// De esta manera, cors() aplicará las reglas que definimos dentro de corsConfig.
export const corsConfig: CorsOptions = {
  // Aquí definimos cómo manejar los orígenes (domains) que hacen peticiones al servidor.
  // origin: es el dominio que hace la solicitud (por ejemplo, "https://midominio.com").
  // callback: es una función que debemos llamar para permitir o rechazar el acceso.
  origin: function (origin, callback) {
    // Se crea una lista blanca (whitelist) con los dominios permitidos.
    // En este caso, sólo se permite el dominio definido en la variable de entorno FRONTEND_URL.
    const whitelist = [process.env.FRONTEND_URL];
    if (process.argv[2] === `--api`) {
      whitelist.push(undefined)
    }
    // Se comprueba si el origen que intenta acceder está dentro de la lista blanca:
    // Si sí está → se llama callback(null, true)
    // Esto le dice a CORS que sí se permite el acceso.
    // Si no está → se llama callback(new Error("Error de CORS"))
    // Esto lanza un error y bloquea la petición.
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Error de CORS"));
    }
  }
}