const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const salt = bcrypt.genSaltSync(10);
const fs = require("fs");
const secret = "thisasecret";
const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

mongoose.connect(
  "mongodb+srv://blog:EJu1xNdj9sIl1fXu@blog-page.gzqcw6k.mongodb.net/?retryWrites=true&w=majority"
);

app.get("/profile", (req, res) => {
  const { token } = req.cookies;

  try {
    const info = jwt.verify(token, secret);
    res.json(info);
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

// app.get("/profile", (req, res) => {
//   const { token } = req.cookies;
//   jwt.verify(token, secret, {}, (err, info) => {
//     if (err) throw err;
//     res.json(info);
//   });
// });

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const UserDoc = await User.findOne({ username });
    if (!UserDoc) {
      return res.status(400).json("User not found");
    }
    const passOK = bcrypt.compareSync(password, UserDoc.password);
    if (passOK) {
      jwt.sign({ username, id: UserDoc.id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie("token", token).json({
          id: UserDoc._id,
          username,
        });
      });
    } else {
      res.status(400).json("Wrong credentials");
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.get("/post", async (req, res) => {
  const posts = await Post.find()
    .populate("author", ["username"])
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(posts);
});
app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content } = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
    });
    res.json({ postDoc });
  });
});
// app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
//   try {
//     const { originalname, path } = req.file;
//     const parts = originalname.split(".");
//     const ext = parts[parts.length - 1];
//     const newPath = path + "." + ext;
//     fs.renameSync(path, newPath);

//     const { username, id: userId } = req.user; // Assuming req.user contains the authenticated user information

//     jwt.sign({ username, id: userId }, secret, {}, (err, token) => {
//       if (err) throw err;
//       res.cookie("token", token).json({
//         id: userId,
//         username,
//       });
//     });

//     const { title, summary, content } = req.body;
//     const postDoc = await Post.create({
//       title,
//       summary,
//       content,
//       cover: newPath,
//       author: userId,
//     });
//     res.json({ postDoc });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Failed to create post" });
//   }
// });

app.get("/post", async (req, res) => {
  res.json(
    await Post.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20)
  );
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});

app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newPath = path + "." + ext;
    fs.renameSync(path, newPath);
  }
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json("you are not the author");
    }
    try {
      postDoc.title = title;
      postDoc.summary = summary;
      postDoc.content = content;
      postDoc.cover = newPath || postDoc.cover;
      await postDoc.save();

      res.json(postDoc);
    } catch (error) {
      console.error("Error updating post:", error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the post." });
    }
  });
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

// app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
//   let newPath = null;
//   if (req.file) {
//     const { originalname, path } = req.file;
//     const parts = originalname.split(".");
//     const ext = parts[parts.length - 1];
//     newPath = path + "." + ext;
//     fs.renameSync(path, newPath);
//   }
//   const { token } = req.cookies;
//   jwt.verify(token, secret, {}, async (err, info) => {
//     if (err) throw err;
//     const { id, title, summary, content } = req.body;
//     const postDoc = await Post.findById(id);
//     const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
//     res.json({ isAuthor, postDoc, info });
//     if (!isAuthor) {
//       return res.status(400).json("you are not author");
//     }
//     await postDoc.Update({
//       title,
//       summary,
//       content,
//       cover: newPath ? newPath : postDoc.cover,
//     });

//     res.json(postDoc);
//   });
// });

//EJu1xNdj9sIl1fXu
//mongodb+srv://blog:EJu1xNdj9sIl1fXu@blog-page.gzqcw6k.mongodb.net/?retryWrites=true&w=majority
