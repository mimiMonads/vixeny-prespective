import { vixeny } from "vixeny";
import { describe, expect, it } from "@jest/globals";
import { pugStaticServerPlugin } from "../../src/pug/staticServer.ts";

const serve = vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/",
    template: pugStaticServerPlugin(),
  },
]);

describe("compile", async () => {
  it("validPath", async () =>
    expect(
      await Promise.resolve(serve(
        new Request("http://localhost:8000/main.pug"),
      ))
        .then((res) => res.text()),
    )
      .toBe("<p>'s Pug source code!</p>"));
});