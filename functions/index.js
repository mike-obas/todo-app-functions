const functions = require("firebase-functions");
const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.json());

const { 
    manageTodo, 
    deleteTodo, 
    firstBatchTodos,
    eachTodo
   } = require('./handlers/todo');

app.post("/manageTodo/:queryType", manageTodo);
app.get('/deleteTodo/:noteId', deleteTodo);
app.get("/getTodos/:orderClause", firstBatchTodos);
app.get("/eachTodo/:noteId", eachTodo);

//APIs will be deployed as cloud functions
exports.api = functions.region('europe-west2').https.onRequest(app);