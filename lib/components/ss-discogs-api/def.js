export default {
  catalog: {
    author: "Creatake",
    description: `Fetches release data from Discogs API for a release.`,
    ico: "compact-disc",
    tags: ["api", "discogs"],
  },
  isBypass: true,
  type: "control",
  attrs: [
    {
      kid: "Release ID",
      type: "String",
      initValue: "7454399",
    },
    {
      kid: "Data",
      type: "Text",
      initValue: "",
    },
  ],
};
