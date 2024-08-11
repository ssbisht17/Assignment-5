/******************************************************************************** *  WEB700 – Assignment 06 
*  
*	I declare that this assignment is my own work in accordance with Seneca's *  Academic Integrity Policy: 
*  
*	https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
*  
*	Name: Sachin Singh Bisht Student ID: 147996235 Date: Aug 11,2024 
* 
*	Published URL: ___________________________________________________________ 
* 
********************************************************************************/


// Define the port the server will listen on, using environment variable PORT or default to 8080
const HTTP_PORT = process.env.PORT || 8080;
const express = require("express"); // Import Express framework
const path = require("path"); // Import path module for working with file and directory paths
const collegeData = require("./modules/collegeData"); // Import custom module for handling college data
const exphbs = require('express-handlebars'); // Import Express Handlebars for template rendering

const app = express(); // Create an instance of Express

// Middleware to serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Configure express-handlebars as the template engine
app.engine('.hbs', exphbs.engine({
    extname: '.hbs', // Set file extension for templates
    defaultLayout: 'main', // Set the default layout
    helpers: {
        navLink: function (url, options) {
            // Helper function for rendering navigation links with active class based on the active route
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        eq: function (lvalue, rvalue, options) {
            // Helper function for conditionally rendering content if two values are equal
            if (lvalue === rvalue) {
                return options.fn(this);  // Renders the block if values are equal
            } else {
                return options.inverse(this);  // Renders the {{else}} block if values are not equal
            }
        }
    }
}));
app.set('view engine', '.hbs'); // Set Handlebars as the view engine

// Middleware to set the active route for the navbar, which is used by the navLink helper
app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Middleware to parse the request body (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Route handler for displaying students
app.get("/students", (req, res) => {
    const courseId = req.query.course ? parseInt(req.query.course) : null; // Get course ID from query parameter, if present
    const studentPromise = courseId ? collegeData.getStudentsByCourse(courseId) : collegeData.getAllStudents(); // Get students based on course ID

    studentPromise
        .then(data => {
            if (data.length > 0) {
                res.render("students", { students: data }); // Render students view with data if students exist
            } else {
                res.render("students", { message: courseId ? "No students found for this course" : "No students found" }); // Render message if no students found
            }
        })
        .catch(err => {
            console.error('Error retrieving students:', err);
            res.status(500).render('students', { message: "Error retrieving students" }); // Handle errors
        });
});

// Route handler for displaying courses
app.get("/courses", (req, res) => {
    collegeData.getCourses()
        .then(data => {
            res.render("courses", { courses: data.length > 0 ? data : [], message: data.length > 0 ? null : "No courses found" }); // Render courses view with data or message
        })
        .catch(err => {
            console.error('Error retrieving courses:', err);
            res.status(500).render("courses", { message: "Error retrieving courses" }); // Handle errors
        });
});

// Route handler for displaying a specific course by ID
app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(parseInt(req.params.id))
        .then(data => {
            data ? res.render("course", { course: data }) : res.status(404).render("course", { message: "Course not found" }); // Render course view or not found message
        })
        .catch(err => {
            console.error('Error retrieving course:', err);
            res.status(500).render("course", { message: "Error retrieving course" }); // Handle errors
        });
});

// Route handler for displaying a specific student by their student number
app.get('/student/:studentNum', (req, res) => {
    let viewData = {};

    collegeData.getStudentByNum(req.params.studentNum)
        .then((data) => {
            if (data) {
                viewData.student = data; // store student data in the "viewData" object as "student"
            } else {
                viewData.student = null; // if no student found, set student to null
            }
        })
        .catch(() => {
            viewData.student = null; // if there was an error, set student to null
        })
        .then(collegeData.getCourses)
        .then((data) => {
            viewData.courses = data; // store course data in the "viewData" object as "courses"

            // loop through viewData.courses and once we have found the courseId that matches
            // the student's "course" value, add a "selected" property to the matching viewData.courses object
            for (let i = 0; i < viewData.courses.length; i++) {
                if (viewData.courses[i].courseId == viewData.student.course) {
                    viewData.courses[i].selected = true;
                }
            }
        })
        .catch(() => {
            viewData.courses = []; // if there was an error, set courses to empty
        })
        .then(() => {
            if (viewData.student == null) { // if no student - return an error
                res.status(404).send("Student Not Found");
            } else {
                res.render("student", { viewData: viewData }); // render the "student" view
            }
        });
});

// Route handler for the home page
app.get("/", (req, res) => res.render('home'));

// Route handler for the about page
app.get("/about", (req, res) => res.render('about'));

// Route handler for the HTML demo page
app.get("/htmlDemo", (req, res) => res.render('htmlDemo'));

// Route handler for the "add student" page
app.get("/students/add", (req, res) => {
    collegeData.getCourses()
        .then(data => res.render('addStudent', { courses: data })) // Render add student view with courses data
        .catch(err => {
            console.error('Error retrieving courses for add student form:', err);
            res.render('addStudent', { courses: [] }); // Handle errors by rendering form without course options
        });
});

// Route handler for adding a new student
app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => res.redirect('/students')) // Redirect to the students page after adding the student
        .catch(err => {
            console.error('Error adding student:', err);
            res.status(500).send('Error adding student'); // Handle errors
        });
});

// Route handler for updating an existing student
app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => res.redirect("/students")) // Redirect to the students page after updating the student
        .catch(err => {
            console.error('Error updating student:', err);
            res.status(500).send('Error updating student'); // Handle errors
        });
});

// Route handler for the "add course" page
app.get("/courses/add", (req, res) => res.render('addCourse'));

// Route handler for adding a new course
app.post("/courses/add", (req, res) => {
    collegeData.addCourse(req.body)
        .then(() => res.redirect('/courses')) // Redirect to the courses page after adding the course
        .catch(err => {
            console.error('Error adding course:', err);
            res.status(500).send('Error adding course'); // Handle errors
        });
});

// Route handler for updating an existing course
app.post("/course/update", (req, res) => {
    collegeData.updateCourse(req.body)
        .then(() => res.redirect('/courses')) // Redirect to the courses page after updating the course
        .catch(err => {
            console.error('Error updating course:', err);
            res.status(500).send('Error updating course'); // Handle errors
        });
});

// Route handler for deleting a course by ID
app.get("/course/delete/:id", (req, res) => {
    collegeData.deleteCourseById(parseInt(req.params.id))
        .then(() => res.redirect('/courses')) // Redirect to the courses page after deleting the course
        .catch(err => {
            console.error('Error deleting course:', err);
            res.status(500).send("Unable to Remove Course / Course not found"); // Handle errors
        });
});

// 404 route handler for undefined routes (must be the last route)
app.use((req, res) => res.status(404).render('404', { message: "Page Not Found" }));

// Initialize the data and start the server
collegeData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => console.log(`Server listening on port: ${HTTP_PORT}`)); // Start server after data initialization
    })
    .catch(err => console.log(`Failed to initialize data: ${err}`)); // Handle errors during initialization