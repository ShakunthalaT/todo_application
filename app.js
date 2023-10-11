const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
var isValid = require("date-fns/isValid");

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server is running at http://localhost:3000")
    );
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) =>{
    return(
        requestQuery.priority !== undefined $$ requestQuery.status !== undefined
    );
};

const hasPriorityProperty = (requestQuery) =>{
    return
        requestQuery.priority !== undefined;
    
}; 

const hasStatusProperty = (requestQuery) =>{
    return
        requestQuery.status !== undefined;
    
};

const hasCategoryAndStatus = (requestQuery) =>{
    return(
        requestQuery.category !== undefined && requestQuery.status !== undefined
    );
};

const hasCategoryAndProperty = (requestQuery) =>{
    return(
        requestQuery.category !== undefined && requestQuery.priority !== undefined
    );
};
const hasSearchProperty = (requestQuery) =>{
    return
        requestQuery.search_q !== undefined;
    
};

const hasCategoryProperty = (requestQuery) =>{
    return
        requestQuery.category !== undefined;
    
};
const outPutResult =(dbObject) =>{
    return{
        id:dbObject.id,
        todo:dbObject.todo,
        priority:dbObject.priority,
        category:dbObject.category,
        status:dbObject.status,
        dueDate:dbObject.due_date,
    };
};

app.get("/todos/"async(request,response)=>{
    let date = null;
    let getTodosQuery = "";
    const{search_q = "",priority,status,category} = request.query;
    switch(true){
        case hasPriorityAndStatusProperties(request.query);
        if(priority === "HIGH" || priority === "MEDIUM" || priority === "LOW"){
            if(status === "TO DO" ||
               status === "IN PROGRESS" || 
               status === "DONE"){
                   getTodosQuery = `
                   SELECT * FROM todo WHERE status = '${status} AND priority = '${priority};'`;
                    data  = await database.all(getTodosQuery);
                    response.send(data.map((each) =>outPutResult(each)));
               }else{
                   response.status(400);
                   response.send("Invalid Todo Status");
               }
             }else{
                   response.status(400);
                   response.send("Invalid Todo Priority");
               }
           break;
        
        case hasCategoryAndStatus(request.query);
        if(
            category === "WORK" ||
            category === "HOME" || 
            category === "LEARNING"
        ){
            if(
                status === "TO DO" ||
                status === "IN PROGRESS" ||
                status === "DONE"
            ){
                getTodosQuery = `SELECT * FROM todo WHERE  category ='${category} and status ='${status};`;
                data  = await database.all(getTodosQuery);
                response.send(data.map((each) =>outPutResult(each)));
            }else{
                response.status(400);
                response.send("Invalid Todo Status");
            }
        }  else{
                 response.status(400);
                 response.send("Invalid Todo Category");
            }
            break;
           case hasCategoryAndPriority(request.query);
             if(
            category === "WORK" ||
            category === "HOME" || 
            category === "LEARNING"
        ) {

            if(
                priority === "HIGH" ||
                priority === "MEDIUM" ||
                priority === "LOW"
            ){
                getTodosQuery = `SELECT * FROM todo WHERE  category ='${category} and priority ='${priority};`;
                data  = await database.all(getTodosQuery);
                response.send(data.map((each) =>outPutResult(each)));
            }else{
                response.status(400);
                response.send("Invalid Todo Priority");
            }
        }  else{
                 response.status(400);
                 response.send("Invalid Todo Category");
            }
            break;
           
        case hasPriorityProperty(request.Query);
         
          if(
                priority === "HIGH" ||
                priority === "MEDIUM" ||
                priority === "LOW"
            ){
                getTodosQuery = `SELECT * FROM todo WHERE  priority ='${priority};`;
                data  = await database.all(getTodosQuery);
                response.send(data.map((each) =>outPutResult(each)));
            }else{
                response.status(400);
                response.send("Invalid Todo Priority");
            }
            break;
               case hasStatusProperty(request.query);
               if(
                status === "TO DO" ||
                status === "IN PROGRESS" ||
                status === "DONE"
            ){
                getTodosQuery = `SELECT * FROM todo WHERE status ='${status};`;
                data  = await database.all(getTodosQuery);
                response.send(data.map((each) =>outPutResult(each)));
            }else{
                 response.status(400);
                 response.send("Invalid Todo Status");
            }
            break;
        
        case hasSearchProperty(request.Query);
           getTodosQuery = `SELECT * FROM todo WHERE  todo like '%${search_q}%;`;
                data  = await database.all(getTodosQuery);
                response.send(data.map((each) =>outPutResult(each)));
            break;
        case hasCategoryProperty(request.Query);
        if(
            category === "WORK" ||
            category === "HOME" || 
            category === "LEARNING"
        ) 
              {
                getTodosQuery = `SELECT * FROM todo WHERE category ='${category};`;
                data  = await database.all(getTodosQuery);
                response.send(data.map((each) =>outPutResult(each)));
            }else{
                response.status(400);
                response.send("Invalid Todo Category");
            }
         break;
         
    default:
               getTodosQuery = `SELECT * FROM todo ;`;
                data  = await database.all(getTodosQuery);
                response.send(data.map((each) =>outPutResult(each)));
        
        }
        }); 

        app.get("/todos/:todoId/",async(request,response)=>{
            const {todoId} = request.params;
            const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
            const responseResult = await database.get(getTodoQuery);
            response.send(outPutResult(responseResult));
        });
        app.get("/agenda/",async(request,response)=>{
            const {data} = request.params;
            console.log(isMatch(date,"yyyy-MM-dd"));
            if(isMatch(date,"yyyy-MM-dd")){
                const newDate = format(new Date(date),"yyyy-MM-dd");
                console.log(newDate);
            
            const requestQuery = `SELECT * FROM todo WHERE due_date = ${newDate};`;
            const responseResult = await database.all(requestQuery);
            response.send(responseResult.map((each)=>outPutResult(each)));
        } else{
            response.status(400);
            response.send("Invalid Due Date");
        }
    });
    app.post("/todos/",async(request,response)=>{
      const {id,todo,priority,status,category,dueDate} = request.body;
       if(
                priority === "HIGH" ||
                priority === "LOW" ||
                priority === "MEDIUM"
            ){
      
      if(     status === "TO DO" ||
                status === "IN PROGRESS" ||
                status === "DONE"
            ){
       if(
            category === "WORK" ||
            category === "HOME" || 
            category === "LEARNING"
        ){
            if(isMatch(dueDate,"yyyy-MM-dd")){
                const postNewDueDate = format(new Date(dueDate),"yyyy-MM-dd"); 
                const postTodoQuery = `
                INSERT INTO
                todo(id,todo,category,priority,status,due_date)
                VALUES
                (${id},${todo},${category},${priority},${status},${due_date});`;
                await database.run(postTodoQuery);
                response.send("Todo Successfully Added");
            }else{
                response.status(400);
                response.send("Invalid Due Date");
            }
        }else{
             response.status(400);
             response.send("Invalid Todo Category");
        }
    }else{
         response.status(400);
        response.send("Invalid Todo Status");
    }
}else{
     response.status(400);
     response.send("Invalid Todo Priority");
}
});
app.put("/todos/:todoId/",async(request,response)=>{
    const{todoId} = request.params;
    let updatedColumn = "";
    const requestBody = request.body;
    console.log(requestBody);
    const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
    const previousTodo = await database.get(previousTodoQuery);
    const{
        todo = previousTodo.todo,
        priority = previousTodo.priority,
        status = previousTodo.status,
        category = previousTodo.category,
        dueDate = previousTodo.dueDate,
    } = request.body;
 
   let updatedTodoQuery;
    switch(true){
        case requestBody.status !== undefined;
        if(status === "TO DO" || status === "IN PROGRESS" || status === "DONE"){
            updatedTodoQuery=`
            UPDATE todo SET todo ='${todo},category='${category}',priority='${priority}',status='${status}',
            due_date='${dueDate} WHERE id = ${todoId};`;
        await database.run(updatedTodoQuery);
        response.send("Status Updated");
       }else{
        response.status(400);
        response.send("Invalid Todo Status");
    }  
  break;
  //update

    case requestBody.priority !== undefined;
        if(priority === "HIGH" || priority === "LOW" || priority === "MEDIUM"){
            updatedTodoQuery=`
            UPDATE todo SET todo ='${todo},priority='${priority}',status='${status},category='${category}',
            due_date='${dueDate} WHERE id = ${todoId};`;
        await database.run(updatedTodoQuery);
        response.send("Priority Updated");
       }
    else{
        response.status(400);
        response.send("Invalid Todo Priority");
    }
  break;
  case requestBody.todo !== undefined; 
         updatedTodoQuery=`UPDATE todo SET todo ='${todo},priority='${priority}',status='${status},category='${category}',
            due_date='${dueDate} WHERE id = ${todoId};`;
        await database.run(updatedTodoQuery);
        response.send("Todo Updated");
    break;
  case requestBody.category !== undefined;
        if(category === "WORK" || category === "HOME" || category === "LEARNING"){
            updatedTodoQuery=`
            UPDATE todo SET todo ='${todo},priority='${priority}',status='${status},category='${category}',
            due_date='${dueDate} WHERE id = ${todoId};`;
        await database.run(updatedTodoQuery);
        response.send("Category Updated");
       }
    else{
        response.status(400);
        response.send("Invalid Todo category");
    }
break;
 case requestBody.dueDate !== undefined;
        if(isMatch(dueDate,"yyyy-MM-dd")){
            const newDueDate = format(new Date(dueDate),"yyyy-MM-dd");
            updatedTodoQuery=`
            UPDATE todo SET todo ='${todo},priority='${priority}',status='${status},category='${category}',
            due_date='${dueDate} WHERE id = ${todoId};`;
        await database.run(updatedTodoQuery);
        response.send("Due Date Updated");
       }
    else{
        response.status(400);
        response.send("Invalid Due Date");
    }
  break;
}
});


app.delete("/todos/:todoId",async(request,response=>{
    const{todoId} = request.params;
    const deleteTodoQuery = `
    DELETE FROM
    todo
    WHERE
    id = ${todoId};`;
    await database.run(deleteTodoQuery);
    response.send("Todo Deleted");
});

module.exports = app;
