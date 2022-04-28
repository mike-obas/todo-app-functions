const { isEmpty } = require("./filterEntries");
  
  exports.validateTodoData = (data) => {
    let errors = {};
    if(isEmpty(data.title)) errors.title = 'Must not be empty';
    if(isEmpty(data.description)) errors.description = 'Must not be empty';
    return{
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
  }
  

