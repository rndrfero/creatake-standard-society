<template><slot /></template>

<script>
import { onMounted, watch } from "vue";
import { ComponentProps, commonFunctionsFactory } from "../../descriptor";

export default {
  props: Object.assign({}, ComponentProps),
  setup(props) {
    const { v, s } = commonFunctionsFactory(props);

    const fetchRelease = async () => {
      const releaseId = v("Release ID");
      if (!releaseId) {
        return;
      }

      try {
        const response = await fetch(
          `https://api.discogs.com/releases/${releaseId}`
        );
        const data = await response.json();
        s("Data", JSON.stringify(data));
        console.log("Discogs release data:", data);
      } catch (error) {
        console.error("Failed to fetch Discogs release:", error);
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
  },
};
</script>
