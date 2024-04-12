# @flatfile/plugin-graphql-schema

This package automatically converts GraphQL to the Flatfile Blueprint, a powerful DDL (Data Definition Language) created by Flatfile with a focus on validation and data preparation.

## Get Started

```bash
npm install @flatfile/plugin-graphql-schema
```

### Example Sources
Pass a URL to a GraphQL endpoint
```
listener.use(
  configureSpaceGraphQL(
    {
      workbooks: [
        {
          name: 'GraphQL Workbook',
          source: 'https://spacex-production.up.railway.app/',
        },
      ],
    }
  )
)
```

Pass a function that returns a GraphQL schema
```
listener.use(
  configureSpaceGraphQL(
    {
      workbooks: [
        {
          name: 'GraphQL Workbook',
          source: (event: FlatfileEvent) => {
            const characterInterface = new GraphQLInterfaceType({
              name: 'Character',
              fields: { name: { type: GraphQLString } },
            })

            const humanType = new GraphQLObjectType({
              name: 'Human',
              interfaces: [characterInterface],
              fields: { name: { type: GraphQLString } },
            })

            const droidType = new GraphQLObjectType({
              name: 'Droid',
              interfaces: [characterInterface],
              fields: { name: { type: GraphQLString } },
            })

            const schema = new GraphQLSchema({
              query: new GraphQLObjectType({
                name: 'Query',
                fields: {
                  hero: { type: characterInterface },
                },
              }),
              // Since this schema references only the `Character` interface it's
              // necessary to explicitly list the types that implement it if
              // you want them to be included in the final schema.
              types: [humanType, droidType],
            })
            return schema
          },
        },
      ],
    }
  )
)
```

Pass an SDL string
```
listener.use(
  configureSpaceGraphQL(
    {
      workbooks: [
        {
          name: 'GraphQL Workbook',
          source: fs.readFileSync(
            path.join(__dirname, 'sample.graphql'),
            'utf8'
          ),
        },
      ],
    }
  )
)
```

### Example Sheet Filtering
Providing sheets will filter the schema to only generate the sheets for GraphQL objects that match the provided sheet slugs. 
```
listener.user(
  configureSpaceGraphQL(
    {
      workbooks: [
        {
          name: 'GraphQL Workbook',
          source: 'https://spacex-production.up.railway.app/',
          sheets: [{ slug: 'Capsule' }],
        },
      ],
    }
  )
)
```

### Advanced Example
```
listener.use(
  configureSpaceGraphQL(
    {
      workbooks: [
        {
          name: 'GraphQL Workbook',
          source: 'https://spacex-production.up.railway.app/',
          sheets: [
            {
              name: 'Capsules',
              slug: 'Capsule',
              actions: [
                {
                  operation: 'dedupeEmail',
                  mode: 'background',
                  label: 'Dedupe emails',
                  description: 'Remove duplicate emails',
                },
              ],
            }
          ],
        },
      ],
      space: {
        metadata: {
          theme: {
            root: {
              primaryColor: 'black',
            },
            sidebar: {
              logo: 'https://images.ctfassets.net/hjneo4qi4goj/33l3kWmPd9vgl1WH3m9Jsq/13861635730a1b8af383a8be8932f1d6/flatfile-black.svg',
            },
          },
        },
      },
      documents: [
        {
          title: 'Welcome',
          body: `<div>
          <h1 style="margin-bottom: 36px;">Welcome!</h1>
          <h2 style="margin-top: 0px; margin-bottom: 12px;">To get started, follow these steps:</h2>
          <h2 style="margin-bottom: 0px;">1. Step One</h2>
          <p style="margin-top: 0px; margin-bottom: 8px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <h2 style="margin-bottom: 0px;">2. Step Two</h2>
          <p style="margin-top: 0px; margin-bottom: 8px;">Consectetur libero id faucibus nisl tincidunt eget. Pellentesque elit eget gravida cum sociis natoque penatibus et. Tempor orci eu lobortis elementum nibh.</p>
          </div>`,
        },
      ],
    },
    async (event, workbookIds, tick) => {
      const { spaceId } = event.context
      console.log('Space configured', { spaceId, workbookIds })
      await tick(99, 'Space configured')
    }
  )
)
```

Follow [this guide](https://flatfile.com/docs/plugins/schemas/convert-graphql) to learn how to use the plugin.