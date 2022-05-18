import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import nock from "nock";
chai.use(chaiHttp);

const URL = "http://localhost:8080";

describe("createIdentity", () => {
  before(() => {
    nock(URL).get("/users/createIdentity").reply(200, {
      key: "0x1231123123",
    });
  });
  const server = chai.request(URL);
  it("createIdentity", (done) => {
    server.get("/users/createIdentity").end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.key).to.equals("0x1231123123");
      done();
    });
  });
});
