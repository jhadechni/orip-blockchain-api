import { Express } from "express";
import UserRoute from "./user.route";
import CertificateRoute from "./certificate.route";
import PQRSDRoute from "./pqrsd.route";
import EncodingRoute from "./encoding.route";

const configRoutes = (app: Express) => {
  app.use("/users", UserRoute);
  app.use("/certificate", CertificateRoute);
  app.use("/pqrsd", PQRSDRoute);
  app.use("/encoding", EncodingRoute);
};

export default configRoutes;
