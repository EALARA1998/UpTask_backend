import server from "./server"
import colors from "colors"

const port = process.env.PORT || 4000

server.listen(port, () => {
  console.log(colors.bgCyan.bold(`REST API funcionando en el puerto ${port}`))
})

/**
 * npm init --y
 * npm i express
 * npm i @types/express 
 * npm i -D nodemon ts-node typescript
 * npm i colors
 * MongoDB Atlas
 * MongoDB Compass
 * npm i dotenv
 * npm i mongoose 
 * https://mongoosejs.com/docs/schematypes.html
 * MVC
 * npm i express-validator
*/