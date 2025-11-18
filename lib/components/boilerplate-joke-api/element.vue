<template><slot :variables="variables" /></template>

<script>
import {onMounted, onUnmounted, ref, computed} from 'vue';
import {
  ComponentProps,
  commonFunctionsFactory,
  emitter,
} from '../../descriptor';

export default {
  props: Object.assign({}, ComponentProps),
  setup(props) {
    const {s, k} = commonFunctionsFactory(props);

    const data = ref('');

    const fetchJoke = async () => {
      console.log('fetchJoke');

      try {
        const response = await fetch(
          'https://v2.jokeapi.dev/joke/Any?type=twopart'
        );
        data.value = await response.json();

        s('Setup', data.value.setup);
        s('Delivery', data.value.delivery);
      } catch (error) {
        console.error('Failed to fetch joke:', error);
      }
    };

    const onMessage = msg => {
      console.log('onMessage', msg);

      if (msg.hasRecipient && msg.hasRecipient(props.block)) {
        if (msg.kid === 'bang') {
          fetchJoke();
        }
      }
    };

    emitter.on('message', onMessage);

    onMounted(() => {
      fetchJoke();
    });

    onUnmounted(() => {
      emitter.off('message', onMessage);
    });

    const variables = computed(() => {
      return {
        ...props.variables,
        [k('Setup')]: data.value.setup,
        [k('Delivery')]: data.value.delivery,
      };
    });

    return {
      variables,
    };
  },
};
</script>
