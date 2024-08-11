const Sequelize = require('sequelize');

// Set up Sequelize with PostgreSQL
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'jBeRib6NL4SU', {
    host: 'ep-cool-meadow-a5pvprw2.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define the Course model
const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
}, {
    tableName: 'courses',
    timestamps: false
});

// Define the Student model
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING,
    courseId: {
        type: Sequelize.INTEGER,
        references: {
            model: Course,
            key: 'courseId'
        }
    }
}, {
    tableName: 'students',
    timestamps: false
});

// Define relationships
Course.hasMany(Student, { foreignKey: 'courseId', onDelete: 'SET NULL' });
Student.belongsTo(Course, { foreignKey: 'courseId' });

// Function to initialize the data
function initialize() {
    return sequelize.sync()
        .then(() => {
            console.log('Database & tables created!');
            return Promise.resolve();
        })
        .catch(err => {
            console.error('Error initializing database:', err);
            return Promise.reject('unable to sync the database');
        });
}

// Function to get all students
function getAllStudents() {
    return Student.findAll()
        .then(students => {
            if (students.length === 0) {
                return Promise.reject('no results returned');
            }
            return Promise.resolve(students);
        })
        .catch(err => {
            console.error('Error fetching students:', err);
            return Promise.reject('no results returned');
        });
}

// Function to get all courses
function getCourses() {
    return Course.findAll()
        .then(courses => {
            if (courses.length === 0) {
                return Promise.reject('no results returned');
            }
            return Promise.resolve(courses);
        })
        .catch(err => {
            console.error('Error fetching courses:', err);
            return Promise.reject('no results returned');
        });
}

// Function to get students by course
function getStudentsByCourse(courseId) {
    return Student.findAll({ where: { courseId } })
        .then(students => {
            if (students.length === 0) {
                return Promise.reject('no results returned');
            }
            return Promise.resolve(students);
        })
        .catch(err => {
            console.error('Error fetching students by course:', err);
            return Promise.reject('no results returned');
        });
}

// Function to get student by student number
function getStudentByNum(num) {
    return Student.findOne({ where: { studentNum: num } })
        .then(student => {
            if (!student) {
                return Promise.reject('no results returned');
            }
            return Promise.resolve(student);
        })
        .catch(err => {
            console.error('Error fetching student by number:', err);
            return Promise.reject('no results returned');
        });
}

// Function to add a new student
function addStudent(studentData) {
    // Ensure TA property is set to true/false and empty values are replaced with null
    studentData.TA = (studentData.TA) ? true : false;
    for (let key in studentData) {
        if (studentData[key] === "") {
            studentData[key] = null;
        }
    }

    return Student.create(studentData)
        .then(student => {
            return Promise.resolve(student);
        })
        .catch(err => {
            console.error('Error creating student:', err);
            return Promise.reject('unable to create student');
        });
}

// Function to get a course by ID
function getCourseById(id) {
    return Course.findOne({ where: { courseId: id } })
        .then(course => {
            if (!course) {
                return Promise.reject('no results returned');
            }
            return Promise.resolve(course);
        })
        .catch(err => {
            console.error('Error fetching course by ID:', err);
            return Promise.reject('no results returned');
        });
}

// Function to update a student's data
function updateStudent(studentData) {
    // Ensure TA property is set to true/false and empty values are replaced with null
    studentData.TA = (studentData.TA) ? true : false;
    for (let key in studentData) {
        if (studentData[key] === "") {
            studentData[key] = null;
        }
    }

    return Student.update(studentData, { where: { studentNum: studentData.studentNum } })
        .then(([rowsUpdated]) => {
            if (rowsUpdated === 0) {
                return Promise.reject('unable to update student');
            }
            return Promise.resolve(studentData);
        })
        .catch(err => {
            console.error('Error updating student:', err);
            return Promise.reject('unable to update student');
        });
}

// Function to add a new course
function addCourse(courseData) {
    // Ensure empty values are replaced with null
    for (let key in courseData) {
        if (courseData[key] === "") {
            courseData[key] = null;
        }
    }

    return Course.create(courseData)
        .then(() => {
            return Promise.resolve();
        })
        .catch(err => {
            console.error('Error creating course:', err);
            return Promise.reject('unable to create course');
        });
}

// Function to update a course
function updateCourse(courseData) {
    // Ensure empty values are replaced with null
    for (let key in courseData) {
        if (courseData[key] === "") {
            courseData[key] = null;
        }
    }

    return Course.update(courseData, { where: { courseId: courseData.courseId } })
        .then(([rowsUpdated]) => {
            if (rowsUpdated === 0) {
                return Promise.reject('unable to update course');
            }
            return Promise.resolve();
        })
        .catch(err => {
            console.error('Error updating course:', err);
            return Promise.reject('unable to update course');
        });
}

// Function to delete a course by ID
function deleteCourseById(id) {
    return Course.destroy({ where: { courseId: id } })
        .then(rowsDeleted => {
            if (rowsDeleted === 0) {
                return Promise.reject('course not found');
            }
            return Promise.resolve();
        })
        .catch(err => {
            console.error('Error deleting course:', err);
            return Promise.reject('unable to delete course');
        });
}

// Function to delete a student by student number
function deleteStudentByNum(studentNum) {
    return Student.destroy({ where: { studentNum: studentNum } })
        .then(rowsDeleted => {
            if (rowsDeleted === 0) {
                return Promise.reject('student not found');
            }
            return Promise.resolve();
        })
        .catch(err => {
            console.error('Error deleting student:', err);
            return Promise.reject('unable to delete student');
        });
}

// Export the functions for use in other modules
module.exports = { initialize, getAllStudents, getCourses, getStudentsByCourse, getStudentByNum, addStudent, getCourseById, updateStudent, addCourse, updateCourse, deleteCourseById, deleteStudentByNum };