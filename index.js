import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import Project from "./models/Project.js";
import Skill from "./models/Skills.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// Middleware Setup
// ==========================================

// Enable CORS so your React frontend
app.use(cors());

// Parse JSON request bodies (essential for React API calls)
app.use(express.json());

// Parse URL-encoded request bodies (for traditional HTML form submits)
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public folder
app.use(express.static("public"));

// Configure Pug template engine (retained from Assignment 1)
app.set("view engine", "pug");
app.set("views", "./views");

// ==========================================
// Database Connection
// ==========================================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ==========================================
// Server-Rendered Page Routes (Pug Views)
// ==========================================

// Home Page
app.get("/", async (req, res) => {
  res.render("index");
});

// Projects Page
app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.render("projects", { projects });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Skills Page
app.get("/skills", async (req, res) => {
  try {
    const skills = await Skill.find();
    res.render("skills", { skills });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Add Project Page Form
app.get("/addProject", (req, res) => {
  res.render("addProject");
});

// Add Skill Page Form
app.get("/addSkill", (req, res) => {
  res.render("addSkill");
});

// Contact Page
app.get("/contact", (req, res) => {
  res.render("contact");
});

// ==========================================
// REST API Routes (Consumed by React Front-End)
// ==========================================

// GET: Fetch all projects
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Failed to retrieve projects" });
  }
});

// GET: Fetch single project by ID
app.get("/api/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({ error: "Failed to retrieve project" });
  }
});

// POST: Create project (Supports both React JSON payloads & HTML Form posts)
app.post("/api/projects", async (req, res) => {
  try {
    const newProject = await Project.create(req.body);

    // If request comes from React (JSON content-type), return JSON response
    if (req.is("json")) {
      return res.status(201).json(newProject);
    }

    // Default redirect for classic HTML form submission
    res.redirect("/projects");
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// DELETE/POST: Delete project
app.post("/api/projects/:id/delete", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);

    if (req.is("json")) {
      return res.status(200).json({ message: "Project deleted successfully" });
    }

    res.redirect("/projects");
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// GET: Fetch all skills
app.get("/api/skills", async (req, res) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (err) {
    console.error("Error fetching skills:", err);
    res.status(500).json({ error: "Failed to retrieve skills" });
  }
});

// GET: Fetch single skill by ID
app.get("/api/skills/:id", async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }
    res.json(skill);
  } catch (err) {
    console.error("Error fetching skill:", err);
    res.status(500).json({ error: "Failed to retrieve skill" });
  }
});

// POST: Create skill (Supports both React JSON payloads & HTML Form posts)
app.post("/api/skills", async (req, res) => {
  try {
    const newSkill = await Skill.create(req.body);

    if (req.is("json")) {
      return res.status(201).json(newSkill);
    }

    res.redirect("/skills");
  } catch (err) {
    console.error("Error creating skill:", err);
    res.status(500).json({ error: "Failed to create skill" });
  }
});

// DELETE/POST: Delete skill
app.post("/api/skills/:id/delete", async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);

    if (req.is("json")) {
      return res.status(200).json({ message: "Skill deleted successfully" });
    }

    res.redirect("/skills");
  } catch (err) {
    console.error("Error deleting skill:", err);
    res.status(500).json({ error: "Failed to delete skill" });
  }
});

// ==========================================
// Start Server
// ==========================================

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
