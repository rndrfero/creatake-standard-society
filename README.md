# Creatake Elements Extensions Boilerplate

This is boilerplate project for creation of elements extensions for Creatake editor.
It contains standard configuration, recommended project structure and all other information needed to create extension.

## What are Extensions?

Creatake is a visual programming environment where designers and programmers collaborate to build web projects. Extensions allow developers to create custom elements (Vue components) that extend the designer's palette.

**Extension workflow:**
1. **Developer**: Create Vue component locally (VS Code, Vite, localhost)
2. **Developer**: Build as UMD module and deploy/serve
3. **Designer**: Import extension URL into Creatake project
4. **Designer**: Use new element visually alongside built-in blocks

Extensions are the future of Creatake - eventually all built-in components will become extensions, making Creatake a pure visual programming runtime (like Max/MSP with its externals).

See `/ARCHITECTURE.md` in the main repository for overall system design.

## Configuration

[Creatake](https://www.creatake.com/) editor expects that elements extension is built using [VueJS](https://v3.vuejs.org/) (v3) framework and provided in single JavaScript file built in form of universal module definition (UMD) which includes also optional CSS styles injected by JavaScript and also all needed dependencies of that extension besides VueJS which is provided by Creatake editor.

This can be ensured by using [vitejs](https://vitejs.dev/) which provides this setup out of the box by using [library mode](https://vitejs.dev/guide/build.html#library-mode) which is also used by this boilerplate.

### Build configuration

#### `vite.config.js`

Build time configuration is defined in file [vite.config.js](./vite.config.js). Let's explore what is crucial for our extension in the configuration:

```javascript
const path = require('path');
const pluginVue = require('@vitejs/plugin-vue');

module.exports = {
  plugins: [pluginVue()], // we are building Vue project
  build: {
    cssCodeSplit: true, // this option will include all CSS styles into JavaScript UMD bundle
    lib: {
      // we are building library (Vite Library Mode)
      entry: path.resolve(__dirname, 'lib/index.js'), // this is our entry file
      name: 'ct.extensions.your-extension-name', // extension name - see below for more information
    },
    rollupOptions: {
      external: ['vue'], // vue dependency will be provided by editor, we don't want to include it in the extension bundle
      output: {
        globals: {
          vue: 'Vue', // vue dependency will be provided as global variable
        },
      },
    },
  },
};
```

##### `lib.name`:

It requires special attention because it's crucial part how extension will be integrated with the Creatake Editor.
After extension is installed in the Editor, it will try to read it from global variable `ct.extensions.{your-extension-name}`. So by this configuration we can specify such behaviour, that vitejs will built our extension into single global variable which will be stored as property of global object `ct.extensions`.

Very important is also that you will choose name of your extension to be specific to avoid conflicting extensions when user decides to install more extensions. We do not recomend choosing generic names like `custom-elements`, `components`, etc. We rather recomend to choose something specific, the best with prefix of your organisation, e.g. `ct-animation-elements` or `delorean-components` ;-).

#### `package.json`

There are no other requirements to package.json besides that `vue` dependency cannot be specified in `dependencies` but in `devDependencies` and `peerDependencies`, because it is provided by the Creatake Editor.

It's possible to use additional dependencies as you wish, they just need to be included in extension bundle output which vite does automatically.

### Runtime configuration

Creatake Editor expects that extension defined in global variable `ct.extensions` is an object that follows interface `CtExtension` and has following structure:

```typescript
interface CtExtension {
  manifest: {
    name: string; // extension name
    description?: string; // optional extension description
    homepage?: string; // optional extension website
    icon?: string; // optional extension icon (it can be link to image or base64 data url)
  };
  elements: Map<string, CtElement>; // map of elements which extension contains. Map entry consists of element name and element itself which is described in CtElement interface.
}
```

This configuration you can find in `index.js` in the `lib` directory of this project.

```typescript
interface CtElement {
  def: CtElementDefinition; // definition of component (loaded from element's def.js file)
  element: VueComponent; // default export of Vue component
}

interface CtElementDefinition {
  catalog: {
    author: string; // author of the element
    description: string; // description of the element
    color: string; // text color of the element in the Editor
    backgroundColor: string; // background color of the element in the Editor
    ico: string; // icon of the element in the Editor - name from free version of https://fontawesome.com
    tags: string[]; // list of tags under element can be found, it can be empty array
  };
  type: 'block' | 'bypass' | 'flex' | 'inline' | 'text' | 'none'; // element type FERO/TODO: doplnil som dalsie typy. teraz ked pozeram na typ 'none' ta neviem ci by sme ho nemali nejak premenovat. to su take elementy, ktore nerenderuju NIC
  attrs?: CtElementDefAttr[]; // optional configurable attributes for this element
}

interface CtElementDefAttr {
  kid: string; // element attribute key: FERO/TODO: popisat ze toto vznika automaticky na zaklade naming convention suboru, alebo je to mozne zadefinovat aj inac v rozpore s konvenciou ?
  type: CtElementAttrType; // what type of input will be displayed for element attribute configuration
  initValue?: any; // optional initial value
  step?: number; // optional increasing / decreasing step in case of Number type
  min?: number; // optional min value in case of Number type
  max?: number; // optional max value in case of Number type
  choices?: Array<CtElementDefAttrChoice>; // optional choices in case of Select | Pick | Options type
}

enum CtElementAttrType {
  // Please refer to Reference Types element in the Editor
  // regarding information about every attribute type
  Page = 'Page',
  String = 'String',
  Text = 'Text',
  Number = 'Number',
  Color = 'Color',
  Boolean = 'Boolean',
  Dimension = 'Dimension',
  Vector2 = 'Vector2',
  Csv = 'Csv',
  Space = 'Space',
  Area = 'Area',
  Fill = 'Fill',
  ParagraphStyle = 'ParagraphStyle',
  Select = 'Select',
  Pick = 'Pick',
  Options = 'Options',
  BorderStyle = 'BorderStyle',
  TextStyle = 'TextStyle',
  Ratio = 'Ratio',
}

interface CtElementDefAttrChoice {
  label: string; // choice label
  value: string; // choice value which will be stored for attribute
  ico?: string; // optional icon for choice (not used in all choices)
  color?: string; // optional icon for choice (not used in all choices)
  backgroundColor?: string; // optional icon for choice (not used in all choices)
}
```

## Project Structure

```
- lib                  # extension code
  - components         # elements dir - each subdir contains one element
    - element-example  # [Element Example]'s dir - name/kid is derived from dirname
      - def.js         # definition file as per above interface
      - element.vue    # Vue component
      - index.js       # export of definition and Vue component based on CtComponent interface
    - another-element  # [Another Element]'s dir
      - def.js
      - element.vue
      - index.js
    ...
  - componentProps.js  # common props which Vue components receives from Creatake Editor
  - index.js           # entry file which contains extension definition based on CtExtension interface
- package.json
- vite.config.js
```

## Testing and using extension

Please check [Extending Creatake Editor]() section of our community [Wiki]() with full documentation and [Video Tutorials] describing each step of development and integration in details.

### Build extension

Before we can install extension in the Editor we must build it. To do that, we need to run vite build by running `npm run build` or `yarn build` in terminal (note that package.json in this project has `build` script which runs vite build).

### Serve extension UMD bundle

You can upload extension UMD bundle to some public domain which is setup to run with https protocol (we do not support http) or you can serve extension bundle from localhost e.g. by running `npm run serve` in the terminal for this project (note that package.json in this project has `serve` script which starts simple http server to serve extension from dist directory).

### Install extension into Creatake Editor

You can open some or new project in Creatake Editor and install extension by clicking to extensions management (puzzle icon at the top) which will open dialog where you can provide extension URL. There you can provide either extension sitting on public domain or localhost (e.g. in this case http://localhost:5001/ct-boilerplate.umd.js).

After instalation you should be able to see information about extension in management dialog and elements from this extension should be available in elements browser which is opened when you try to insert new element into active artboard.

### Extension lifespan

Please note that extension must be always available so project can be built with it. In case project has set some extension and it's not currently available, Creatake Editor will still work, but it will show `Lost Element` for elements used from this extension. Same is applied for live preview. It will work, but elements from that extension won't show because they are applied in runtime.

Hovewer, when you try to build project and extension URL is not accessible, the build will fail and you won't be able to build such project. But when project is already built, then extension URL don't need to be accessible anymore, because extension is downloaded into project during build and it will be bundled together with project.

### Extension development

The boilerplate project has package script `yarn start` which starts static server on `5001` port and will be watching files for changes.

When you change some extension file, it will rebuild extension bundle. Then you can just simply refresh browser with Editor and it will load new version of the extension with your latest changes.

#### Extension bundle URL

The bundle to install you can find on this url: `http://localhost:{port}/{extension-name}.umd.js` so in case of this boilerplate it is http://localhost:5001/ct-boilerplate.umd.js.

#### Extension static server port

Note that static server port you can change in package.json `serve` script.
