import app from "../index";
import chai, { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);

describe("createIdentity", () => {
  const server = chai.request(app);
  it("/createIdentity", (done) => {
    server.get("/users/createIdentity").end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.key).to.have.lengthOf(160);
      done();
    });
  });
});
