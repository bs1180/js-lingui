import path from "path"
/**
 * Fellow contributor!
 * *Never* import `extract` module outsite `it` or `beforeAll`. It would
 * break mocking of extractors in `extract` test suit.
 */
import mockFs from "mock-fs"

describe("extract", function() {
  let extract, babel, typescript

  beforeAll(() => {
    jest.doMock("./extractors/babel", () => ({
      match: jest.fn(
        filename => filename.endsWith(".js") || filename.endsWith(".ts")
      ),
      extract: jest.fn()
    }))

    // load before mocking FS
    extract = require("./extract").extract
    babel = require("./extractors/babel")

    mockFs({
      src: {
        "index.html": "",

        components: {
          "Babel.js": "",
          "Typescript.ts": "",
          forbidden: {
            "apple.js": ""
          }
        },

        forbidden: {
          "file.js": ""
        }
      }
    })
  })

  afterAll(() => {
    mockFs.restore()
  })

  it("should traverse directory and call extractors", function() {
    extract(["src"], "locale", {
      ignore: ["forbidden"]
    })

    expect(babel.match).toHaveBeenCalledWith(
      path.join("src", "components", "Typescript.ts")
    )
    expect(babel.match).toHaveBeenCalledWith(
      path.join("src", "components", "Babel.js")
    )
    expect(babel.match).toHaveBeenCalledWith(path.join("src", "index.html"))

    // This file is ignored
    expect(babel.extract).not.toHaveBeenCalledWith(
      path.join("src", "index.html")
    )

    expect(babel.extract).toHaveBeenCalledWith(
      path.join("src", "components", "Babel.js"),
      "locale"
    )
    expect(babel.extract).toHaveBeenCalledWith(
      path.join("src", "components", "Typescript.ts"),
      "locale"
    )
  })
})

describe("collect", function() {
  beforeAll(() => {
    mockFs({
      src: {
        components: {
          "Ignore.js": "Messages are collected only from JS files.",
          "Broken.json": "Invalid JSONs are ignored too.",
          "Babel.json": JSON.stringify({
            "Babel Documentation": {
              defaults: "Babel Documentation",
              origin: [["src/components/Babel.js", 5]]
            },
            Label: {
              defaults: "Label",
              origin: [["src/components/Babel.js", 7]]
            }
          }),
          "Typescript.json": JSON.stringify({
            "Typescript Documentation": {
              defaults: "Typescript Documentation",
              origin: [["src/components/Typescript.ts", 5]]
            },
            Label: {
              defaults: "Label",
              origin: [["src/components/Typescript.ts", 7]]
            }
          })
        }
      }
    })
  })

  afterAll(() => {
    mockFs.restore()
  })

  it("should traverse directory and collect messages", function() {
    const { collect } = require("./extract")
    const catalog = collect("src")
    expect(catalog).toMatchSnapshot()
  })
})

describe("cleanObsolete", function() {
  it("should remove obsolete messages from catalogs", function() {
    const { cleanObsolete } = require("./extract")

    const catalogs = {
      en: {
        Label: {
          translation: "Label"
        },
        PreviousLabel: {
          obsolete: true
        }
      },
      fr: {
        Label: {
          translation: "Label"
        },
        Obsolete: {
          translation: "Obsolete",
          obsolete: true
        }
      }
    }

    expect(cleanObsolete(catalogs)).toMatchSnapshot()
  })
})
