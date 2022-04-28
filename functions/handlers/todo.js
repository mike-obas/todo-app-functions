const { admin, db } = require("../util/admin");
const { validateTodoData } = require("../util/validators");
const { reduceTodoDetails } = require("../util/detailsValidator");

//create and edit/update todos
exports.manageTodo = (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ message: "Method not allowed" });
  }
  let { newTodo } = reduceTodoDetails(req.body);
  const { valid, errors } = validateTodoData(newTodo);
  if (!valid) return res.status(400).json(errors);

  let queryType;
  let message;

  let collectionName = "todos";
  //this will keep track of the number of todos
  let countObject = {};
  countObject[collectionName] = admin.firestore.FieldValue.increment(+1);

  if (req.params.queryType === "save") {
    queryType = db.collection(collectionName).add(newTodo);
    message = "created";
    db.doc(`todoCount/countField`)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          db.doc(`todoCount/countField`).set(countObject);
        } else {
          db.doc(`todoCount/countField`).update(countObject);
        }
      })
      .catch((err) => res.json(err));
  } else {
    //params.queryType will represent the document Id to be updated
    delete newTodo.createdAt
    queryType = db
      .doc(`${collectionName}/${req.params.queryType}`)
      .update(newTodo);
    message = "updated";
  }
  queryType
    .then(() => {
      return res.json({
        generalMessage: `Your todo has been ${message} successfully`,
      });
    })
    .catch((err) => {
      res.status(500).json({ generalError: `something went wrong` });
    });
};

//delete todo
exports.deleteTodo = (req, res) => {
  let noteId = req.params.noteId;
  let collectionName = "todos";
  let countObject;
  db.doc(`todoCount/countField`)
    .get()
    .then(async (doc) => {
      countObject = { ...doc.data() };
      let countValue = countObject[collectionName];
      countObject[collectionName] = countValue - 1;
    })
    .catch(() => res.json("something went wrong, try again"));

  const getImages = db.doc(`${collectionName}/${noteId}`);
  getImages
    .get()
    .then(async () => {
      await db.doc(`${collectionName}/${noteId}`).delete();
      await db.doc(`todoCount/countField`).update(countObject);
    })
    .then(() => {
      res.json({ message: `Your todo has been deleted successfully` });
    })
    .catch((err) => {
      res.status(400).json({ error: `something went wrong ${err.code}` });
    });
};
//get first batch of todos
exports.firstBatchTodos = (req, res) => {
  let collectionName = "todos";
  let orderClause = req.params.orderClause;
  let orderArray = orderClause.split("-");
    async function queryItems(db) {
      const firstBatch = await db.collection(`${collectionName}`)
      .orderBy(`${orderArray[0]}`, `${orderArray[1]}`)
      .limit(50);
      return firstBatch.get();
    }
    queryItems(db)
      .then((snapshot) => {
        if(snapshot.docs.length === 0){
        return res.status(404).json({noTodo: 'Tap here to add a note'});
        }
        let lastDocument = snapshot.docs[snapshot.docs.length - 1];
        lastDocument = lastDocument.data().createdAt;
        let todos = [lastDocument];
        snapshot.forEach((doc) => {
          todos.push({
            noteId: doc.id,
            ...doc.data()
          });
        });
        return res.json(todos);
      })
      .catch((err) => {
        res.json({error: "couldn't get items"})
      });
  }
//get individual product
exports.eachTodo = (req, res) => {
  let collectionName = "todos";
  let noteId = req.params.noteId;
  db.doc(`${collectionName}/${noteId}`).get()
  .then(doc => {
    if(!doc.exists){
      return res.status(404).json({error: 'product not found'});
    }
    let TodoData = {
          noteId: doc.id,
      ...doc.data()
    };
    return res.json(TodoData);
  })
  .catch(err => ( 
    res.status(500).json({error: "couldn't get items"})
  ))
};