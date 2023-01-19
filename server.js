const express = require('express');
const fs = require('fs');
const path = require('path');
const idRandom = require('./helpers/randomId');

const PORT = process.env.PORT || 9000;

const app = express();

// Middleware for parsing request body, serve static files, and parse the JSON payload
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());

//Route for reading file and parsing the notes data
app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      return res.json(JSON.parse(data));
    }
  });
});

//Route for deleting notes. Reads the file, parses the data and finds the note with right ID and then rewrites the file.
app.delete('/api/notes/:id', (req, res) => {
  const deleteNoteId = req.params.id;

  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      let extractNotes = JSON.parse(data);
      const indexOfId = extractNotes.findIndex((obj) => obj.id === deleteNoteId);
      if (indexOfId > -1) {
        extractNotes.splice(indexOfId, 1);
      }
      fs.writeFile(
        './db/db.json',
        JSON.stringify(extractNotes, null, 4),
        (err) =>
          err ? res.status(400).json({ error: err.message }) : console.log('Database updated')
      );
    }
  });

  res.sendFile(path.join(__dirname, './db/db.json'));
});

//Route for creating a new note
app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      id: randomId(),
    };

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        const extractNotes = JSON.parse(data);

        extractNotes.push(newNote);

        fs.writeFile(
          './db/db.json',
          JSON.stringify(extractNotes, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info('Successfully updated notes, rejoice!')
        );
      }
    });

    const response = {
      status: 'success',
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json('Error posting note');
  }
});

// handles any request in the notes directory
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

// handles any get request for this directory
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// start server after npm start command
app.listen(PORT, () =>
  console.log(`Listening at this location http://localhost:${PORT}`)
);