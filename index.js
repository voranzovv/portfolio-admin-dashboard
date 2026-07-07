import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Project from "./models/Project.js";
import Skill from "./models/Skills.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

//db connection

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

//middleware

app.set("view engine", "pug");
app.set("views", "./views");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//page routes

// Home Page
app.get("/", async (req, res) => {
  res.render("index");
});

// Projects Page
app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find();

    res.render("projects", {
      projects,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Skills Page
app.get("/skills", async (req, res) => {
  try {
    const skills = await Skill.find();

    res.render("skills", {
      skills,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Add Project Page
app.get("/addProject", (req, res) => {
  res.render("addProject");
});

// Add Skill Page
app.get("/addSkill", (req, res) => {
  res.render("addSkill");
});

// Contact Page
app.get("/contact", (req, res) => {
  res.render("contact");
});

//API routes

// Get all projects
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find();

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Get single project
app.get("/api/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).send("Project not found");
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Create project
app.post("/api/projects", async (req, res) => {
  try {
    await Project.create(req.body);

    res.redirect("/projects");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating project");
  }
});

// Delete project
app.post("/api/projects/:id/delete", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);

    res.redirect("/projects");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting project");
  }
});

// Get all skills
app.get("/api/skills", async (req, res) => {
  try {
    const skills = await Skill.find();

    res.json(skills);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Get single skill
app.get("/api/skills/:id", async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).send("Skill not found");
    }

    res.json(skill);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Create skill
app.post("/api/skills", async (req, res) => {
  try {
    await Skill.create(req.body);

    res.redirect("/skills");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating skill");
  }
});

// Delete skill
app.post("/api/skills/:id/delete", async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);

    res.redirect("/skills");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting skill");
  }
});

//start server

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
