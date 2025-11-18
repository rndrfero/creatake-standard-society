<template>
  <div :style="style" class="el-boilerplate-hello-world" @click="blockClick">
    <slot name="renderer" />
    {{ v('text') }}<slot />
  </div>
</template>

<script>
import {ComponentProps, commonFunctionsFactory} from '../../descriptor';
import {computed} from 'vue';

export default {
  props: Object.assign({}, ComponentProps),
  setup(props) {
    const {v, blockClick} = commonFunctionsFactory(props);

    const style = computed(() => ({
      backgroundColor: v('backgroundColor'),
      color: v('color'),
    }));

    return {
      blockClick,
      style,
      v,
    };
  },
};
</script>
<style>
.el-boilerplate-hello-world {
  position: relative;
  display: block;
  overflow: hidden;
  padding: 1em;
}
</style>
