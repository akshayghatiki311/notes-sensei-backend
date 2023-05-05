const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// fetch all notes of an user(/api/notes/fetchallnotes) Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal server error");
  }
});

// add note(/api/notes/addnote) Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter title").isLength({ min: 3 }),
    body("description", "Enter description").isLength({ min: 10 }),
    body("tag", "Enter valid tag").isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { title, description, tag } = req.body;
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  }
);

// update an existing note(/api/notes/updatenote) Login required
router.put(
  "/updatenote/:id",
  fetchuser,
  [
    body("title", "Enter title").isLength({ min: 3 }),
    body("description", "Enter description").isLength({ min: 10 }),
    body("tag", "Enter valid tag").isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { title, description, tag } = req.body;
      const newNote = {};
      if (title) {
        newNote.title = title;
      }
      if (description) {
        newNote.description = description;
      }
      if (tag) {
        newNote.tag = tag;
      }

      const note = await Notes.findById(req.params.id);
      if (!note) {
        res.status(404).send("Not found");
      }
      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("You cannot update other's notes");
      }
      const updatedNote = await Notes.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
      );
      res.json(updatedNote);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  }
);

// delete an existing note(/api/notes/deletenote) Login required
router.delete(
    "/deletenote/:id",
    fetchuser,
    async (req, res) => {
      try {
        const note = await Notes.findById(req.params.id);
        if (!note) {
          res.status(404).send("Not found");
        }
        if (note.user.toString() !== req.user.id) {
          return res.status(401).send("You cannot delete other's notes");
        }
        const deletedNote = await Notes.findByIdAndDelete(req.params.id);
        res.json(deletedNote);
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal server error");
      }
    }
  );
  

module.exports = router;
