/** @jsx geckoJSX */
/** @jsxFrag geckoJSX */

import { File, Text, geckoJSX } from '@flatfile/gecko'

export function PackageJsonFile(props: {
  pluginName: string
  description?: string
  category: string
  author?: string
}) {
  return (
    <File name="package.json">
      <Text>
        {`{
  "name": "@flatfile/plugin-${props.pluginName}",
  "version": "0.0.0",
  "url": "https://github.com/FlatFilers/flatfile-plugins/tree/main/plugins/${props.pluginName}",
  "description": "${props.description}",
  "registryMetadata": {
    "category": "${props.category}"
  },
  "engines": {
    "node": ">= 16"
  },
  "source": "src/index.ts",
  "main": "dist/main.js",
  "module": "dist/module.mjs",
  "types": "dist/types.d.ts",
  "scripts": {
    "build": "parcel build",
    "build:watch": "parcel watch",
    "build:prod": "NODE_ENV=production parcel build",
    "check": "tsc ./**/*.ts --noEmit --esModuleInterop",
    "test": "jest --passWithNoTests"
  },
  "keywords": [
    "flatfile-plugins",
    "category-${props.category}"
  ],
  "author": "${props.author}",
  "repository": {
    "type": "git",
    "url": "https://github.com/FlatFilers/flatfile-plugins.git",
    "directory": "plugins/${props.pluginName}"
  },
  "license": "ISC",
  "dependencies": {
  },
  "peerDependencies": {
    "@flatfile/api": "^1.8.0",
    "@flatfile/listener": "^1.0.1"
  }
}
`}
      </Text>
    </File>
  )
}
