# @private/sandbox

This is a development sandbox for plugins. To get started, go to the repo root and run:

```bash
npm install
npm run build
```

Navigate to the plugin you're working on and run:

```bash
cd plugins/<plugin_name>
npm run build:watch
```

Running the `build:watch` script automatically updates the sandbox whenever you make changes to the plugin(s).

Now navigate to the sandbox folder and copy `.env.example` to `.env` and update it with your environment variables.

Finally, run the sandbox with:

```bash
cd ../.. # go to the repo root
cd flatfilers/sandbox
npm run dev
```

If you have multiple environments, you can create a new `.env.prod`, `.env.staging`, and `.env.local` files with the appropriate environment variables and run `npm run dev:<environment>`.

