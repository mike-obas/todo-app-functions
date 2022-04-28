const {isEmpty} = require("./filterEntries") ;

  exports.reduceTodoDetails = (data) => {
  
    let newTodo = {
    createdAt: new Date().toISOString()
  };
  if(!isEmpty(data.title)) newTodo.title = data.title;
  if(!isEmpty(data.description)) newTodo.description = data.description;
  
  return { newTodo };
  }