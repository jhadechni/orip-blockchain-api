import app from "../index";
import chai, { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);

describe("EncodingWorks", () => {
  const server = chai.request(app);
  it("/encrypt", (done) => {
    server.get("/encoding/encrypt/123").end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.key).to.equals("12be56d5feff6af2a1ea19f16b843d6c");
      done();
    });
  });
});
