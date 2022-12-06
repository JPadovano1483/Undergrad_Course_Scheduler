const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");

app.use(cors());
app.use(express.json());

// cleardb in heroku
// const db = mysql.createConnection({
//   host: "us-cdbr-east-06.cleardb.net",
//   user: "ba47d98a7b19bc",
//   password: "f4d6ec6d",
//   database: "heroku_a19411dd68d921e",
// });

// localhost database - copy of cleardb
const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "password",
  database: "UGCS",
});

app.post("/course", (req, res) => {
  const courseId = req.body.courseId;
  const courseName = req.body.courseName;
  const courseDescription = req.body.courseDescription;
  const credits = req.body.credits;
  db.query("INSERT INTO course (course_id, course_name, course_description, credits) VALUES (?,?,?,?)",
    [courseId, courseName, courseDescription, credits],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    });
});

app.get("/allCourses", (req, res) => {
  db.query("SELECT * FROM course",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    });
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query("SELECT * FROM user WHERE username = ? AND password = ?",
    [email, password],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result.length > 0) {
        res.send(result);
      }
      else {
        res.send("Username or password is incorrect.");
      }
    });
});

app.post("/signup", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const confPassword = req.body.confPassword;

  if (password == confPassword) {
    db.query("INSERT INTO user (username, password, major_name, concentration_name) VALUES (?,?,?,?)",
      [email, password, "", ""],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send(result);
        }
      });
  }
  else {
    res.send("Passwords do not match.");
  }
});

app.get("/courses", (req, res) => {
  db.query("SELECT * FROM course",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    });
});

app.get("/users", (req, res) => {
  db.query("SELECT * FROM user",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    });
});

app.post("/account", (req, res) => {
  const major = req.body.major;
  const concentration = req.body.concentration;
  const minor = req.body.minor;

  db.query("UPDATE user SET major_name = ?, concentration_name = ?, minor_name = ? WHERE username = ?",
    [major, concentration, minor, 'jamie_padovano'],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    });
});

app.get("/plan/:id", (req, res) => {
  const user_id = req.params.id;
  db.query(`SELECT semester_id, course_id, course_name, credits FROM user JOIN plan using(user_id) JOIN semester using(plan_id) JOIN semester_course using(semester_id) JOIN course using(course_id) WHERE user_id=?`,
    user_id,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    });
});

app.get("/semester/:id", (req, res) => {
  const semester_id = req.params.id;
  db.query(`SELECT course_id, course_name, credits, semester_id FROM user JOIN plan using(user_id) JOIN semester using(plan_id) JOIN semester_course using(semester_id) JOIN course using(course_id) WHERE semester_id=?`,
    semester_id,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    });
});

app.post("/reset", (req, res) => {
  const password = req.body.password;
  const confPassword = req.body.confPassword;
  const email = req.body.email;
  if (password == confPassword) {
    db.query(`UPDATE user SET password = ? WHERE username = ?`,
      [password, email],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Password changed.");
          res.send(result);
        }
      });
  }
  else {
    console.log("Passwords do not match.");
    res.send("Passwords do not match.");
  }
});

app.post("/addCourse", (req, res) => {
  const semester_id = req.body.semester_id;
  const course_id = req.body.course_id;
  db.query(`INSERT INTO semester_course VALUES (?,?)`,
    [semester_id, course_id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    });
});

app.post("/deleteCourse", (req, res) => {
  const semester_id = req.body.semester_id;
  const course_id = req.body.course_id;
  db.query(`DELETE FROM semester_course WHERE semester_id=? AND course_id=?`,
    [semester_id, course_id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  )
})

const PORT = 3001;

app.listen(process.env.PORT || PORT, () => {
  console.log(`Your server is running on port ${PORT}`);
});