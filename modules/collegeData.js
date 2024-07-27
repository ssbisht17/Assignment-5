const fs = require('fs'); // Import the fs module
const path = require('path'); // Import the path module for handling file paths

// Class to encapsulate the data for students and courses
class Data {
  constructor(students, courses) {
    this.students = students; 
    this.courses = courses;
  }
}

let dataCollection = null; // Array of students

// Function to initialize the data by reading from JSON files
function initialize() {
  return new Promise((resolve, reject) => {
    // Read the students.json file
    fs.readFile(path.join(__dirname, '../data/students.json'), 'utf8', (err, data) => {
      if (err) {
        reject('Unable to read students.json'); // Reject the promise if there's an error reading the file
        return;
      }
      // Parse the JSON data for students
      let students = JSON.parse(data);
      fs.readFile(path.join(__dirname, '../data/courses.json'), 'utf8', (err, data) => {
        if (err) {
          reject('Unable to read courses.json');
          return;
        }
        let courses = JSON.parse(data);
        // Initialize the dataCollection variable with students and courses data
        dataCollection = new Data(students, courses);
        // Resolve the promise indicating successful initialization
        resolve();
      });
    });
  });
}

// Function to get all students
function getAllStudents() {
  return new Promise((resolve, reject) => {
    if (!dataCollection) {
      // Reject if dataCollection is not initialized
      reject('Data collection not initialized');
      return;
    }
    if (dataCollection.students.length === 0) {
      reject('No results returned'); // Reject if there are no students
      return;
    }
    resolve(dataCollection.students); // Resolve with the list of students
  });
}

// Function to get all courses
function getCourses() {
  return new Promise((resolve, reject) => {
    if (!dataCollection) {
      reject('Data collection not initialized');
      return;
    }
    if (dataCollection.courses.length === 0) {
      // Reject if there are no courses
      reject('No results returned');
      return;
    }
    resolve(dataCollection.courses);
  });
}

// Function to get students by course
function getStudentsByCourse(course) {
  return new Promise((resolve, reject) => {
    if (!dataCollection) {
      reject('Data collection not initialized');
      return;
    }
    // Filter students by course
    let studentsByCourse = dataCollection.students.filter(student => student.course === course);
    if (studentsByCourse.length === 0) {
      // Reject if no students are found
      reject('No results returned');
      return;
    }
    resolve(studentsByCourse); // Resolve with the list of students
  });
}

// Function to get student by student number
function getStudentByNum(num) {
  return new Promise((resolve, reject) => {
    if (!dataCollection) {
      reject('Data collection not initialized');
      return;
    }
    // Find student by student number
    let student = dataCollection.students.find(student => student.studentNum === num);
    if (!student) {
      // Reject if no student is found
      reject('No results returned');
      return;
    }
    resolve(student); // Resolve with the student
  });
}

// Function to add a new student
function addStudent(studentData) {
  return new Promise((resolve, reject) => {
    if (!dataCollection) {
      reject('Data collection not initialized');
      return;
    }
    // Ensure TA property is set to false if undefined
    if (studentData.TA === undefined) {
      studentData.TA = false;
    }

    // Set studentNum property based on current array length + 1
    studentData.studentNum = dataCollection.students.length + 1;

    // Push new studentData to the students array
    dataCollection.students.push(studentData);

    // Resolve the promise to indicate success
    resolve(studentData); // Resolve with the added student data
  });
}

// Function to get a course by ID
function getCourseById(id) {
  return new Promise((resolve, reject) => {
    if (!dataCollection) {
      reject('Data collection not initialized');
      return;
    }
    let course = dataCollection.courses.find(c => c.courseId === id);
    if (course) {
      resolve(course);
    } else {
      reject('Course not found');
    }
  });
}

// Function to update a student's data
function updateStudent(studentData) {
  return new Promise((resolve, reject) => {
    if (!dataCollection) {
      reject('Data collection not initialized');
      return;
    }
    // Find the index of the student to update
    let index = dataCollection.students.findIndex(student => student.studentNum === parseInt(studentData.studentNum));
    if (index === -1) {
      reject('Student not found');
      return;
    }
    // Update the student data
    dataCollection.students[index] = {
      ...dataCollection.students[index],
      ...studentData,
      TA: studentData.TA === 'on' // Handle the TA checkbox
    };
    resolve(studentData); // Resolve the promise with the updated student data
  });
}

// Export the functions for use in other modules
module.exports = { initialize, getAllStudents, getCourses, getStudentsByCourse, getStudentByNum, addStudent, getCourseById, updateStudent };