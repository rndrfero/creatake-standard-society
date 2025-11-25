<template><slot :variables="variables" /></template>

<script>
import { onMounted, watch, computed, ref } from "vue";
import { ComponentProps, commonFunctionsFactory } from "../../descriptor";

export default {
  props: Object.assign({}, ComponentProps),
  setup(props) {
    const { v, s, k } = commonFunctionsFactory(props);
    const dataString = ref("");

    // Personal access token for Discogs API authentication
    const DISCOGS_TOKEN = "xXjuaYaWPmybmLvtArmtRcKBNQMRlruuqumWzave";

    const fetchRelease = async () => {
      const releaseId = v("Release ID");
      if (!releaseId) {
        return;
      }

      try {
        const response = await fetch(
          `https://api.discogs.com/releases/${releaseId}`,
          {
            headers: {
              Authorization: `Discogs token=${DISCOGS_TOKEN}`,
              "User-Agent": "StandardSociety/1.0",
            },
          }
        );
        const responseData = await response.json();
        dataString.value = JSON.stringify(responseData);
        s("Data", dataString.value);
        // console.log('Discogs release data:', responseData);
      } catch (error) {
        console.error("Failed to fetch Discogs release:", error);
        dataString.value = "";
      }
    };

    watch(
      () => v("Release ID"),
      () => {
        fetchRelease();
      },
      { immediate: true }
    );

    onMounted(() => {
      fetchRelease();
    });

    const variables = computed(() => {
      return {
        ...props.variables,
        [k("Data")]: dataString.value,
      };
    });

    return {
      variables,
    };
  },
};
</script>
