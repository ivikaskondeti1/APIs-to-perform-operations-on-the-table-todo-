const express = require("express");
const app = express();
const { format } = require("date-fns");
const path = require("path");
app.use(express.json());
const { open } = require("sqlite");

const sqlite3 = require("sqlite3");
const DbPath = path.join(__dirname, "todoApplication.db");
let Dbobj = null;

const startDbobjandserver = async () => {
  try {
    Dbobj = await open({
      filename: DbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error: ${error.message}`);
    process.exit(1);
  }
};
startDbobjandserver();
const validateQueryDateParams = (request, response, next) => {
  const { date = "date" } = request.query;

  let validateDa = validatedate(date);
  if (validateDa) {
    next();
  } else {
    response.status(400);
    response.send(`Invalid Due Date`);
    console.log(`Invalid Date MW function`);
  }
};
const validateQueryParams = (request, response, next) => {
  const { status = null, priority = null, category = null } = request.query;
  if (
    status == `TO DO` ||
    status == `IN PROGRESS` ||
    status == `DONE` ||
    status == null
  ) {
    if (
      priority == "HIGH" ||
      priority == "MEDIUM" ||
      priority == "LOW" ||
      priority == null
    ) {
      if (
        category == "WORK" ||
        category == "HOME" ||
        category == "LEARNING" ||
        category == null
      ) {
        next();
      } else {
        response.status(400);
        response.send(`Invalid Todo Category`);
        console.log(`Invalid Todo Category`);
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      console.log(`Invalid Todo Priority`);
    }
  } else {
    response.status(400);
    response.send(`Invalid Todo Status`);
    console.log(`Invalid Todo Status`);
  }
};
const validateRequestBody = (request, response, next) => {
  const {
    status = null,
    priority = null,
    category = null,
    dueDate = "nodate",
  } = request.body;
  if (
    status == `TO DO` ||
    status == `IN PROGRESS` ||
    status == `DONE` ||
    status == null
  ) {
    if (
      priority == "HIGH" ||
      priority == "MEDIUM" ||
      priority == "LOW" ||
      priority == null
    ) {
      if (
        category == "WORK" ||
        category == "HOME" ||
        category == "LEARNING" ||
        category == null
      ) {
        let validateDa = validatedate(dueDate);
        if (validateDa) {
          next();
        } else {
          response.status(400);
          response.send(`Invalid Due Date`);
          console.log(`Invalid Date MW function`);
        }
      } else {
        response.status(400);
        response.send(`Invalid Todo Category`);
        console.log(`Invalid Todo Category`);
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      console.log(`Invalid Todo Priority`);
    }
  } else {
    response.status(400);
    response.send(`Invalid Todo Status`);
    console.log(`Invalid Todo Status`);
  }
};
//
app.get("/todos/", validateQueryParams, async (request, response) => {
  const {
    status = "",
    priority = "",
    category = "",
    search_q = "",
  } = request.query;
  // console.log(`status :${status}, priority:${priority}, category:${category}`);
  const getQuery = `select id,todo,priority,status,category,due_date as dueDate from todo where priority LIKE '%${priority}%' and status LIKE '%${status}%' and category LIKE '%${category}%' AND
todo LIKE '%${search_q}%';`;
  const getQueryResponse = await Dbobj.all(getQuery);
  response.send(getQueryResponse);
});

//

app.get("/todos/:todoId/", validateQueryParams, async (request, response) => {
  const { todoId } = request.params;
  // console.log(`status :${status}, priority:${priority}, category:${category}`);
  const getQuery = `SELECT id,todo,priority,status,category,due_date as dueDate from todo WHERE id=${todoId};`;
  const getQueryResponse = await Dbobj.get(getQuery);
  response.send(getQueryResponse);
});

//
app.get("/agenda/", validateQueryDateParams, async (request, response) => {
  const { date = "" } = request.query;
  const dateStr = date.split("-");
  const formattedDate = format(
    new Date(dateStr[0], parseInt(dateStr[1]) - 1, dateStr[2]),
    "yyyy-MM-dd"
  );
  // console.log(`status :${status}, priority:${priority}, category:${category}`);
  const getQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE due_date='${formattedDate}';`;
  const getQueryResponse = await Dbobj.all(getQuery);
  //console.log(dateStr);
  //console.log(formattedDate);
  response.send(getQueryResponse);
});

//create TODO

app.post("/todos/", validateRequestBody, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const dateStr = dueDate.split("-");
  const formattedDate = format(
    new Date(dateStr[0], parseInt(dateStr[1]) - 1, dateStr[2]),
    "yyyy-MM-dd"
  );
  const addTodoQuery = `INSERT INTO todo (id,todo,priority,status,category,due_date) VALUES (
  '${id}',
  '${todo}',
  '${priority}',
  '${status}',
  '${category}',
  '${formattedDate}'
); `;

  const addTodoQueryResponse = await Dbobj.run(addTodoQuery);
  response.send(`Todo Successfully Added`);
});

//PUT method on TODO
app.put("/todos/:todoId/", validateRequestBody, async (Request, Response) => {
  const { todoId } = Request.params;
  const RequestBody = Request.body;
  const {
    status = undefined,
    priority = undefined,
    todo = undefined,
    category = undefined,
    dueDate = undefined,
  } = RequestBody;
  const dateStr = dueDate.split("-");
  const formattedDate = format(
    new Date(dateStr[0], parseInt(dateStr[1]) - 1, dateStr[2]),
    "yyyy-MM-dd"
  );
  if (status !== undefined) {
    const DBquery = `
UPDATE
      todo
    SET
      status='${status}'
      WHERE id=${todoId};`;
    const DBresponce = await Dbobj.run(DBquery);
    Response.send("Status Updated");
  } else if (priority !== undefined) {
    const DBquery = `
UPDATE
      todo
    SET
      priority='${priority}'
      WHERE id=${todoId};`;
    const DBresponce = await Dbobj.run(DBquery);
    Response.send("Priority Updated");
  } else if (todo !== undefined) {
    const DBquery = `
UPDATE
      todo
    SET
      todo='${todo}'
      WHERE id=${todoId};`;
    const DBresponce = await Dbobj.run(DBquery);
    Response.send("Todo Updated");
  } else if (category !== undefined) {
    const DBquery = `
UPDATE
      todo
    SET
      category='${category}'
      WHERE id=${todoId};`;
    const DBresponce = await Dbobj.run(DBquery);
    Response.send("Category Updated");
  } else if (dueDate !== undefined) {
    const DBquery = `
UPDATE
      todo
    SET
      due_date='${formattedDate}'
      WHERE id=${todoId};`;
    const DBresponce = await Dbobj.run(DBquery);
    Response.send("Due Date Updated");
  }
});

//delete Api
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const DeleteTodoIdQuery = `DELETE from todo WHERE id=${todoId};`;
  const DeleteDeleteTodoIdQueryQueryResponse = await Dbobj.run(
    DeleteTodoIdQuery
  );
  //console.log(request.username);
  response.send(`Todo Deleted`);
});
module.exports = app;

function validatedate(dateString) {
  let dateformat = /^(19[0-9]{2}|2[0-9]{3})-(0?[1-9]|1[0-2])-([123]0|[012][1-9]|31)$/;

  // Match the date format through regular expression
  if (dateString.match(dateformat)) {
    let operator = dateString.split("/");

    // Extract the string into month, date and year
    let datepart = [];
    if (operator.length > 1) {
      pdatepart = dateString.split("/");
    }
    let month = parseInt(datepart[0]);
    let day = parseInt(datepart[1]);
    let year = parseInt(datepart[2]);

    // Create list of days of a month
    let ListofDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month == 1 || month > 2) {
      if (day > ListofDays[month - 1]) {
        ///This check is for Confirming that the date is not out of its range
        return false;
      }
    } else if (month == 2) {
      let leapYear = false;
      if ((!(year % 4) && year % 100) || !(year % 400)) {
        leapYear = true;
      }
      if (leapYear == false && day >= 29) {
        return false;
      } else if (leapYear == true && day > 29) {
        console.log("Invalid date format!");
        return false;
      }
    }
  } else {
    console.log("Invalid date format!");
    return false;
  }
  return true;
}
//var a = validatedate("2022-12-31");
//console.log(a);
