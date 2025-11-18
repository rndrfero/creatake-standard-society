export default {
  catalog: {
    author: 'Creatake',
    description: `Boilerplate - Example block element.`,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    ico: 'puzzle-piece',
    tags: ['simple'],
  },
  isBypass: false,
  type: 'block',
  attrs: [
    {
      kid: 'color',
      type: 'Color',
      initValue: '#0000FF',
    },
    {
      kid: 'backgroundColor',
      type: 'Color',
      initValue: '#FFFF00',
    },
    {
      kid: 'text',
      type: 'Text',
      initValue: 'Hello World!',
    },
  ],
};
