import "mocha";
import { expect } from "chai";
import { unescapeString } from "../src/strings";
describe("unescapeQuotes", function () {
    it("correctly unescapes strings", function () {
        expect(unescapeString("\"\"")).to.equal("");
        expect(unescapeString("''")).to.equal("");
        expect(unescapeString("\"'\"")).to.equal("'");
        expect(unescapeString("'\"'")).to.equal("\"");
        expect(unescapeString("\"test\"")).to.equal("test");
        expect(unescapeString("\"test \\\\ test\"")).to.equal("test \\ test");
    });
    it("returns null for non-string things", function () {
        expect(unescapeString("null")).to.equal(null);
        expect(unescapeString("")).to.equal(null);
        expect(unescapeString("label")).to.equal(null);
        expect(unescapeString("'almost")).to.equal(null);
        expect(unescapeString("almost'")).to.equal(null);
        expect(unescapeString("\"almost")).to.equal(null);
        expect(unescapeString("almost\"")).to.equal(null);
    });
    it("handles escape sequences inside", function () {
        expect(unescapeString("\"\\n\"")).to.equal("\n");
        expect(unescapeString("\"\\r\"")).to.equal("\r");
        expect(unescapeString("\"\\t\"")).to.equal("\t");
        expect(unescapeString("\"\\b\"")).to.equal("\b");
        expect(unescapeString("\"\\?\"")).to.equal("\?");
        expect(unescapeString("\"\\377\"")).to.equal("\xFF");
        expect(unescapeString("\"\\xFF\"")).to.equal("\xFF");
        expect(unescapeString("\"\\xA\"")).to.equal("\n");
        expect(unescapeString("\"\\\\\"")).to.equal("\\");
    });
});
