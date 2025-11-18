export default {
  catalog: {
    author: 'Creatake',
    description: `Fetches a random two-part joke from JokeAPI.`,
    color: '#FF6B35',
    backgroundColor: '#FFF5E1',
    ico: 'puzzle-piece',
    tags: ['control', 'api', 'joke'],
  },
  isBypass: true,
  type: 'control',
  attrs: [
    {
      kid: 'Setup',
      type: 'Text',
      initValue: '',
    },
    {
      kid: 'Delivery',
      type: 'Text',
      initValue: '',
    },
  ],
  actions: [
    {
      kid: 'bang',
      desc: 'Re-fetch the joke.',
      ico: 'redo',
    },
  ],
};
