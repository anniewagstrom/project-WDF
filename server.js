const express = require("express");
const { engine } = require("express-handlebars");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 4321;
const db = new sqlite3.Database("mydatabase.db");

// Handlebars setup
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

// Serve static files
app.use(express.static("assets"));
app.use(express.urlencoded({ extended: true }));

// DATABASE INIT

function initTableSkills() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,   -- prevent duplicates
      level INTEGER,
      years INTEGER,
      description TEXT
    )`);

    const skillsData = [
      { name: "HTML", level: 4, years: 2, description: "Markup Language" },
      { name: "CSS", level: 3, years: 2, description: "Styling web pages" },
      { name: "JavaScript", level: 4, years: 2, description: "Programming language for web" }
    ];

    const stmt = db.prepare(
      `INSERT OR IGNORE INTO skills (name, level, years, description) VALUES (?, ?, ?, ?)`
    );

    skillsData.forEach(skill => {
      stmt.run(skill.name, skill.level, skill.years, skill.description);
    });

    stmt.finalize();
  });
}

// Projects Table
function initTableProjects() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT UNIQUE,    -- prevent duplicates
      description TEXT,
      technologies TEXT,
      link TEXT,
      img TEXT
    )`);

    const projectsData = [
      { 
        title: "Gym Image One", 
        description: "First Product Image", 
        technologies: "HTML,CSS,JS", 
        link: "https://example.com", 
        img: "img/gym1.jpg" 
      },
      { 
        title: "Gym Image Two", 
        description: "Second Product Image", 
        technologies: "HTML,CSS,JS", 
        link: "https://example.com/gym", 
        img: "img/gym2.jpg" 
      },
      { 
        title: "Gym Image Three", 
        description: "Third Product Image", 
        technologies: "HTML,CSS,JS", 
        link: "https://example.com/gym", 
        img: "img/gym3.jpg" 
      },
      { 
        title: "Gym Image Four", 
        description: "Fourth Product Image", 
        technologies: "HTML,CSS,JS", 
        link: "https://example.com/gym", 
        img: "img/gym4.jpg" 
      },
      { 
        title: "Gym Image Five", 
        description: "Fifth Product Image.", 
        technologies: "HTML,CSS,JS", 
        link: "https://example.com/gym", 
        img: "img/gym5.jpg" 
      },
      
    ];

    const stmt = db.prepare(
      `INSERT OR IGNORE INTO projects (title, description, technologies, link, img) VALUES (?, ?, ?, ?, ?)`
    );

    projectsData.forEach(project => {
      stmt.run(project.title, project.description, project.technologies, project.link, project.img);
    });

    stmt.finalize();
  });
}

//Users Table
function initTableUsers() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`, ["admin", "password123"]);
}

// ROUTES

// Home page - skills
app.get("/", (req, res) => {
  db.all("SELECT * FROM skills", (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.render("home", { skills: rows });
  });
});

// Projects page
app.get("/projects", (req, res) => {
  db.all("SELECT * FROM projects", (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.render("projects", { projects: rows }); // img comes directly from DB
  });
});

// About, Contact, Login pages
app.get("/about", (req, res) => res.render("about"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/login", (req, res) => res.render("login"));

// Login form submission
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) return res.status(500).send("Database error");
    if (row) res.send(`<h2>Welcome, ${row.username}!</h2>`);
    else res.send("<h2>Invalid login. Try again.</h2>");
  });
});

// ---------------------
// START SERVER
// ---------------------

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  initTableSkills();
  initTableProjects();
  initTableUsers();
});
