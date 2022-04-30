import { Express } from "express";
import UserRoute from "./user.route";

const configRoutes = (app: Express) => {
  app.use("/users", UserRoute);
};

export default configRoutes;
