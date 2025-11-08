// Es una librería qu e permite dar color y estilo al texto en la consola.
import colors from "colors"
// Es una librería de modelado para MongoDB, que facilita conectarse a la base de datos y manejar colecciones como si fueran objetos JavaScript.
import mongoose from "mongoose"

export const connectDB = async () => {
  try {
    // se encarga de abrir una conexión con MongoDB, usando la URL almacenada en la variable de entorno DATABASE_URL.
    const connection = await mongoose.connect(process.env.DATABASE_URL!) // El resultado (connection) contiene información sobre el servidor de MongoDB al que se conectó (host, puerto, etc.).
    const url = `${connection.connection.host}:${connection.connection.port}`
    console.log(colors.magenta.bold(`Mongo Conectado en: ${url}`))
  } catch (error) {
    console.log(colors.red.bold("Error al conectar a la base de datos"))
    // console.log(error)
    process.exit(1)
  }
}