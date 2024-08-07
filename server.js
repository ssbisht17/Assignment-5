/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Sachin Singh Bisht     Student ID: 147996235       Date: 26 July, 2024
*
*  Online (vercel) Link: https://vercel.com/sachins-projects-3ab00d27/assignment-5
*
********************************************************************************/ 

const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const path = require("path");
const collegeData = require("./modules/collegeData");
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');

const app = express();

// Middleware to serve static files from the views directory
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));


// Configure express-handlebars
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options) {
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine', '.hbs');

// Middleware to set the active route for the navbar
app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Middleware to parse the request body
app.use(express.urlencoded({ extended: true }));

// GET /students route
app.get("/students", (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(parseInt(req.query.course))
            .then(data => {
                res.render("students", { students: data });
            })
            .catch(err => {
                errorHandler(res, "Error retrieving students");
            });
    } else {
        collegeData.getAllStudents()
            .then(data => {
                res.render("students", { students: data });
            })
            .catch(err => {
                errorHandler(res, "Error retrieving students");
            });
    }
});

// GET /courses route
app.get("/courses", (req, res) => {
    collegeData.getCourses()
        .then(data => {
            res.render("courses", { courses: data });
        })
        .catch(err => {
            res.render("courses", { message: "No results returned" });
        });
});

// GET /course/:id route
app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(parseInt(req.params.id))
        .then(data => {
            if (data) {
                res.render("course", { course: data });
            } else {
                res.status(404).render("course", { message: "Course not found" });
            }
        })
        .catch(err => {
            res.status(500).render("course", { message: "Error retrieving course" });
        });
});

// GET /student/:num route
app.get("/student/:num", (req, res) => {
    const studentPromise = collegeData.getStudentByNum(parseInt(req.params.num));
    const coursesPromise = collegeData.getCourses();

    Promise.all([studentPromise, coursesPromise])
        .then(([studentData, coursesData]) => {
            if (studentData) {
                res.render("student", { student: studentData, courses: coursesData });
            } else {
                res.status(404).render("student", { message: "Student not found" });
            }
        })
        .catch(err => {
            res.status(500).render("student", { message: "Error retrieving student" });
        });
});


// GET / route
app.get("/", (req, res) => {
    res.render('home');
});

// GET /about route
app.get("/about", (req, res) => {
    res.render('about');
});

// GET /htmlDemo route
app.get("/htmlDemo", (req, res) => {
    res.render('htmlDemo');
});

// Route to display the form for adding a new student
app.get("/students/add", (req, res) => {
    res.render('addstudent');
});


// Route to handle form submission for adding a new student
app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect('/students'); // Redirect to the students page after adding student
        })
        .catch(err => {
            console.error('Error adding student:', err);
            res.status(500).send('Error adding student');
        });
});

//Student update
app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => {
            // Redirect to the students list after updating
            res.redirect("/students");
        })
        .catch((err) => {
            console.error('Error updating student:', err);
            res.status(500).send('Error updating student');
        });
});



// 404 route
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize data and start server
collegeData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`server listening on port: ${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.log(`Failed to initialize data: ${err}`);
    });

// Error handling function
function errorHandler(res, message) {
    res.status(500).json({ error: message });
}