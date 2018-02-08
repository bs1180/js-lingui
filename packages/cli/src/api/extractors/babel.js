// @flow
import { transformFileSync } from "babel-core"
import transformTypescript from '@babel/plugin-transform-typescript'

import linguiTransformJs from "@lingui/babel-plugin-transform-js"
import linguiTransformReact from "@lingui/babel-plugin-transform-react"
import linguiExtractMessages from "@lingui/babel-plugin-extract-messages"

import type { ExtractorType } from "./types"

const babelRe = /\.(j|t)sx?$/i

const extractor: ExtractorType = {
  match(filename) {
    return babelRe.test(filename)
  },

  extract(filename, localeDir) {
    transformFileSync(filename, {
      plugins: [
        // Plugins run before presets, so we need to import trasnform-plugins
        // here until we have a better way to run extract-messages plugin
        // *after* all plugins/presets.
        // Transform plugins are idempotent, so they can run twice.
        transformTypescript,
        linguiTransformJs,
        linguiTransformReact,
        [linguiExtractMessages, { localeDir }]
      ]
    })
  }
}

export default extractor
