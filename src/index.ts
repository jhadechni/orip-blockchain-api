import express from "express";
import morgan from "morgan";
import cors from "cors";
import configRoutes from "./routes";

const app = express();

const PORT = process.env.PORT || 8080;
// Apply middlewares
app.use(
  morgan("tiny", { skip: (req, res) => process.env.NODE_ENV === "test" })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

configRoutes(app);

app.get("/", (req, res) => {
  res.status(200).end("Alive");
});

app.listen(PORT, () => {
  console.log(`App listening in PORT ${PORT}`);
});

export default app;
