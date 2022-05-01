import { Express } from "express";
import UserRoute from "./user.route";
import CertificateRoute from "./certificate.route";

const configRoutes = (app: Express) => {
  app.use("/users", UserRoute);
  app.use("/certificate", CertificateRoute);
};

export default configRoutes;
