const express = require("express");
const { engine } = require("express-handlebars");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 8080;
const db = new sqlite3.Database("mydatabase.db");

// Setup Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

// Serve static files (CSS, images)
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

db.serialize(() => {
  // ------------------------
  // Persons table
  // ------------------------
  db.run(`CREATE TABLE IF NOT EXISTS persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT
  )`);

  // Insert sample data without duplicates
  db.run(`INSERT OR IGNORE INTO persons (id, name, email) VALUES (1, "Alice", "alice@example.com")`);
  db.run(`INSERT OR IGNORE INTO persons (id, name, email) VALUES (2, "Bob", "bob@example.com")`);

  // ------------------------
  // Skills table
  // ------------------------
  db.run(`CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    level INTEGER,
    years INTEGER,
    description TEXT
  )`);

  // Insert sample skills
  db.run(`INSERT OR IGNORE INTO skills (id, name, level, years, description) VALUES (1, "HTML", 4, 2, "Markup language")`);
  db.run(`INSERT OR IGNORE INTO skills (id, name, level, years, description) VALUES (2, "CSS", 3, 2, "Styling web pages")`);
  db.run(`INSERT OR IGNORE INTO skills (id, name, level, years, description) VALUES (3, "JavaScript", 4, 2, "Programming language for web")`);

  // ------------------------
  // Projects table
  // ------------------------
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    technologies TEXT,
    link TEXT
  )`);

  // Insert sample projects
  db.run(`INSERT OR IGNORE INTO projects (id, title, description, technologies, link) VALUES (1, "Portfolio", "My portfolio site", "HTML,CSS,JS", "https://example.com")`);
  db.run(`INSERT OR IGNORE INTO projects (id, title, description, technologies, link) VALUES (2, "Gym Clothes Webshop", "A webshop for fitness clothing", "HTML,CSS,JS", "https://example.com/gym")`);
});

// Root page
app.get("/", (req, res) => {
  db.all("SELECT * FROM skills", (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.render("home", { skills: rows });
   });
});

app.get("/about", (req, res) => {
  db.all("SELECT * FROM persons", (err, rows) => {
    if (err) {
      console.log("DB Error:", err.message); // debug log
      res.status(500).send(err.message);
    } else {
      console.log("About rows:", rows); // debug log
      res.render("about", { persons: rows });
    }
  });
});

// Contact page
app.get("/contact", (req, res) => {
  res.render("contact", {
    email: "fakeemail@example.com",
    phone: "07 07 07 07 07"
  });
});

// Projects page (Gym Clothes Webshop)
const projects = [
  { name: "GymShark", img: "img/gym1.jpg" },
  { name: "Fitness Team", img: "img/gym2.jpg" },
  { name: "Img 3", img: "img/gym3.jpg" },
  { name: "Img 4", img: "img/gym4.jpg" },
  { name: "Img 5", img: "img/gym5.jpg" },
];

app.get("/projects", (req, res) => {
  db.all("SELECT * FROM projects", (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.render("projects", { projects });
  });
});

// Login form (GET)
app.get("/login", (req, res) => {
  res.render("login");
});

// Login form submission (POST)
app.post("/login", (req, res) => {
  const { login, password } = req.body;
  db.get("SELECT * FROM users WHERE username=? AND password=?", [login, password], (err, row) => {
    if (err) return res.status(500).send(err.message);
    if (row) res.send(`Welcome, ${login}!`);
    else res.send("Invalid login");
  });
});


// Raw JSON route
app.get("/rawpersons", (req, res) => {
  db.all("SELECT * FROM persons", (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.send(rows);
  });
});


// HTML list route
app.get("/listpersons", (req, res) => {
  db.all("SELECT * FROM persons", (err, rows) => {
    if (err) return res.status(500).send(err.message);

    let html = "<h1>Persons List</h1><ul>";
    rows.forEach(row => html += `<li>${row.name} - ${row.email}</li>`);
    html += "</ul>";
    res.send(html);
  });
});


// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
