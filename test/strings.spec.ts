import "mocha";
import { expect } from "chai";

import { unescapeQuotes } from "../src/strings";

describe("unescapeQuotes", () => {
  it("correctly unescapes strings", () => {
    expect(unescapeQuotes("\"\"")).to.equal("");
    expect(unescapeQuotes("''")).to.equal("");
    expect(unescapeQuotes("\"'\"")).to.equal("'");
    expect(unescapeQuotes("'\"'")).to.equal("\"");
    expect(unescapeQuotes("\"test\"")).to.equal("test");
    expect(unescapeQuotes("\"test \\\\ test\"")).to.equal("test \\ test");
  });
});
