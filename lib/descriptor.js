import {
  computed,
  inject,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance,
} from 'vue';
import {useStore} from 'vuex';
import mitt from 'mitt';

export const emitter = mitt();

export const ComponentProps = {
  block: {
    type: Object,
    required: true,
  },
  visibleChildren: {
    type: Array,
    default: undefined,
  },
  elementData: {
    type: Object,
    default: undefined,
  },
  tag: {
    type: String,
    default: undefined,
  },
  variables: {
    type: Object,
    default: undefined,
  },
};

export function commonFunctionsFactory(props) {
  const store = useStore();
  const instance = getCurrentInstance();
  const isBuildExport = inject('isBuildExport');

  let wasFirstClick = false;
  let wasScroll = false;
  let clickTimeout;

  // DUPLICATE WITH block-mask.vue
  const isMaskVisible = computed(() => {
    return (
      props.block.isSelected ||
      props.block.isBypassAncestorSelected ||
      isSelectedWithinComposite(props.block)
    );
  });

  const isTreeFollowing = computed(() => {
    return store.state.user.guides.isTreeFollowing;
  });

  const isSelectedWithinComposite = block => {
    if (block.isInComposite) {
      if (isTreeFollowing.value) {
        const compositeBlock = block.compositeParent?.compositeBlock;
        const blockWithinComposite = compositeBlock?.findByUid(block.uid);
        return (
          blockWithinComposite &&
          (blockWithinComposite.isSelected ||
            blockWithinComposite.isBypassAncestorSelected)
        );
      }
      return !!block.compositeSlotInstance?.isSelected;
    }
    return false;
  };

  function click() {
    if (wasScroll) {
      wasScroll = false;
      return;
    }

    if (!props.block.farthestSingleChildBypassAncestor) {
      singleclick();
      return;
    }

    if (!wasFirstClick) {
      wasFirstClick = true;
      singleclick();
      clickTimeout = setTimeout(() => {
        wasFirstClick = false;
      }, store.state.user.doubleclickTimeoutMs);
      return;
    }

    doubleclick();
    wasFirstClick = false;
    clearTimeout(clickTimeout);
  }

  const singleclick = async () => {
    const groupAncestor = getGroupOrCompositeAncestor(props.block);

    if (store.state.editor.tool === 'apply') {
      await store.check('block/applyLookToBlock', {
        block: groupAncestor ?? props.block,
      });
    }

    if (store.state.editor.isMove) {
      store.check('block/changeParentSelected', {
        parent: groupAncestor ?? props.block,
      });
    } else if (store.state.editor.isShift) {
      store.check('block/selectRange', {
        item: groupAncestor ?? props.block,
      });
    } else {
      if (
        store.state.user.guides.isScrollToSelectedElement &&
        !isMaskVisible.value
      ) {
        scrollToElement();
      }
      store.check('block/toggleMultiselect', {
        item: groupAncestor ?? props.block,
      });
    }
  };

  const doubleclick = () => {
    const groupAncestor = getGroupOrCompositeAncestor(props.block);
    if (groupAncestor) {
      return;
    }

    const bypassAncestor = props.block.farthestSingleChildBypassAncestor;
    if (bypassAncestor) {
      store.check('block/toggleMultiselect', {
        item: bypassAncestor,
      });
    }
  };

  const scrollToElement = async () => {
    const blockTreeEl = window.document.querySelector('.block-tree');
    const treeItem = {
      window: window,
      selector: `[data-block-tree-item-uid='${props.block.uid}'] > .name`,
      containerTop: blockTreeEl ? blockTreeEl.offsetTop : 0,
      isTreeItem: true,
    };

    const scrolFn = async () => {
      await store.dispatch('editor/set', {
        path: 'shouldBlockTreeScrollToItem',
        value: false,
      });
      store.dispatch('editor/addScrollItems', {
        items: [treeItem],
      });
    };

    if (isTreeFollowing.value) {
      // have to wait for block tree to be created
      setTimeout(scrolFn, 100);
    } else {
      scrolFn();
    }
  };

  const getGroupOrCompositeAncestor = (block, clickedBlock = block) => {
    // console.log('getGroupOrCompositeAncestor', block.uid);
    if (!block.parent) {
      return null;
    }
    if (block.isGroupSlotInComposite) {
      // console.log('isGroupSlotInComposite');
      if (isTreeFollowing.value && block === clickedBlock) {
        return block.compositeSlotSource;
      } else if (block === clickedBlock) {
        return block.compositeParent?.getCompositeSlotsMap().get(block.uid);
      } else if (block !== clickedBlock) {
        return null;
      }
    } else if (block.isGroupSlot) {
      // console.log('isGroupSlot');
      return clickedBlock;
    }
    if (block.parent.isGroup || block.parent.isComposite) {
      if (block.parent.isComposite && isTreeFollowing.value) {
        return (
          block.parent.compositeBlock?.findByUid(clickedBlock.uid) ??
          block.parent
        );
      }
      const groupAncestor = getGroupOrCompositeAncestor(
        block.parent,
        block.parent
      );
      return groupAncestor ? groupAncestor : block.parent;
    }
    // console.log('to parent');
    return getGroupOrCompositeAncestor(block.parent, clickedBlock);
  };

  return {
    v: kid => props.block.getBlockAttrValue(kid, props.variables),

    k: kid => props.block.getAttrKidByElementAttrKid(kid),

    s: (kid, value) => props.block.setValueByElementAttrKid(kid, value),

    blockClick: (event, elementHandleFunc = undefined) => {
      // console.log('blockClick', props);
      if (isBuildExport || !store.state.editor.isGuides) {
        if (elementHandleFunc) {
          elementHandleFunc(event);
        }
      } else {
        // console.log('blockClick', props.block.uid);
        event.stopPropagation();
        event.preventDefault();

        click();
      }
    },

    onCreatakeAction: actionHandler => {
      function commonActionHandler(msg) {
        if (msg.kid === 'set') {
          console.log('set', props.block.uid, '<-', msg.block.uid);
          for (const source of msg.block.attrs) {
            for (const target of props.block.attrs) {
              if (
                source.kid === target.kid &&
                source.elementAttr.type === target.elementAttr.type
              ) {
                console.log(
                  'set match',
                  source.kid,
                  source.elementAttr.kid,
                  source.elementAttr.type,
                  '->',
                  target.kid,
                  target.elementAttr.kid,
                  target.elementAttr.type
                );
                const value = msg.block.getBlockAttrValue(
                  // source.elementAttr.kid || source.kid, // in case of isDynamic, or maybe composite too ...
                  source.kid,
                  msg.variables
                );
                console.log('value', value);
                props.block.setValue(
                  // target.elementAttr.kid || target.kid,
                  target.kid,
                  value
                );
              }
            }
          }
        }
      }
      function performAction(msg) {
        if (msg.hasRecipient(props.block, instance)) {
          props.block.log('performAction', msg.kid);
          commonActionHandler(msg);
          if (actionHandler) {
            actionHandler(msg);
          }
        }
      }

      onMounted(() => {
        emitter.on('message', performAction);
      });
      onBeforeUnmount(() => {
        emitter.off('message', performAction);
      });
    },

    isMaskVisible,
  };
}
