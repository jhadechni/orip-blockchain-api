import express from "express";
import morgan from "morgan";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 8080;
// Apply middlewares
app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).end("Alive");
});

app.listen(PORT, () => {
  console.log(`App listening in PORT ${PORT}`);
});
