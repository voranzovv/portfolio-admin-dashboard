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
// 1. Enhanced Middleware Configuration
// ==========================================

// Configure CORS for local development and deployed frontend
const allowedOrigins = [
  "http://localhost:5173", // Local Vite React Dev Server
  "http://localhost:3000",
  "https://devportfoliovoran.netlify.app",
  process.env.CLIENT_URL, // Your live Vercel URL (add to .env later)
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Origin not allowed"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "pug");
app.set("views", "./views");

// ==========================================
// Database Connection
// ==========================================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// ==========================================
// Pug Views (Assignment 1 Admin Pages)
// ==========================================

app.get("/", (req, res) => res.render("index"));

app.get("/projects", async (req, res, next) => {
  try {
    const projects = await Project.find();
    res.render("projects", { projects });
  } catch (err) {
    next(err);
  }
});

app.get("/skills", async (req, res, next) => {
  try {
    const skills = await Skill.find();
    res.render("skills", { skills });
  } catch (err) {
    next(err);
  }
});

app.get("/addProject", (req, res) => res.render("addProject"));
app.get("/addSkill", (req, res) => res.render("addSkill"));
app.get("/contact", (req, res) => res.render("contact"));

// ==========================================
// REST API Routes (Assignment 2 React Frontend)
// ==========================================

// --- PROJECTS ENDPOINTS ---

// GET: Fetch all projects
app.get("/api/projects", async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// GET: Fetch single project by ID
app.get("/api/projects/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid Project ID format" });
    }
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// POST: Create project
app.post("/api/projects", async (req, res, next) => {
  try {
    const newProject = await Project.create(req.body);
    if (req.is("json") || req.headers["accept"]?.includes("application/json")) {
      return res.status(201).json(newProject);
    }
    res.redirect("/projects");
  } catch (err) {
    next(err);
  }
});

// DELETE / POST: Delete project (Handles both REST API calls & Pug Form Submissions)
const deleteProjectHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Project ID format" });
    }
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Project not found" });

    if (req.is("json") || req.headers["accept"]?.includes("application/json")) {
      return res
        .status(200)
        .json({ message: "Project deleted successfully", id });
    }
    res.redirect("/projects");
  } catch (err) {
    next(err);
  }
};

app.delete("/api/projects/:id", deleteProjectHandler);
app.post("/api/projects/:id/delete", deleteProjectHandler);

// --- SKILLS ENDPOINTS ---

// GET: Fetch all skills
app.get("/api/skills", async (req, res, next) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (err) {
    next(err);
  }
});

// GET: Fetch single skill by ID
app.get("/api/skills/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid Skill ID format" });
    }
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    res.json(skill);
  } catch (err) {
    next(err);
  }
});

// POST: Create skill
app.post("/api/skills", async (req, res, next) => {
  try {
    const newSkill = await Skill.create(req.body);
    if (req.is("json") || req.headers["accept"]?.includes("application/json")) {
      return res.status(201).json(newSkill);
    }
    res.redirect("/skills");
  } catch (err) {
    next(err);
  }
});

// DELETE / POST: Delete skill
const deleteSkillHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Skill ID format" });
    }
    const deleted = await Skill.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Skill not found" });

    if (req.is("json") || req.headers["accept"]?.includes("application/json")) {
      return res
        .status(200)
        .json({ message: "Skill deleted successfully", id });
    }
    res.redirect("/skills");
  } catch (err) {
    next(err);
  }
};

app.delete("/api/skills/:id", deleteSkillHandler);
app.post("/api/skills/:id/delete", deleteSkillHandler);

// ==========================================
// 2. Global Error Handling Middleware
// ==========================================

// Handle 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ==========================================
// Start Server
// ==========================================

app.listen(port, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${port}`,
  );
});
