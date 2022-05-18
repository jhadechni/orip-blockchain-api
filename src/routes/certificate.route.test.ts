import app from "../index";
import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import nock from "nock";
chai.use(chaiHttp);

const URL = "http://localhost:8080";

describe("Certificate", () => {
  before(() => {
    nock(URL)
      .get("/certificate/0")
      .reply(200, {
        data: {
          name: "Jaime",
        },
      });
  });
  const server = chai.request(URL);
  it("getCertificateMetadata", (done) => {
    server.get(`/certificate/0`).end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.data).to.deep.equal({
        name: "Jaime",
      });
      done();
    });
  });
});
