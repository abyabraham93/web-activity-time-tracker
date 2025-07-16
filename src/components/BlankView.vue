<template>
  <div class="blank-view">
    <!-- Intentionally left empty for privacy during presentations -->
  </div>
</template>

<script lang="ts">
export default {
  name: 'BlankView',
};
</script>

<style scoped>
.blank-view {
  /* Invisible container that takes up space but shows nothing */
  width: 100%;
  height: 100%;
  min-height: 300px;
  background: transparent;
}
</style>
