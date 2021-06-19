<template>
  <div id="equipment-grouping-layout">
    <transition name="fade" mode="out-in">
      <grouping-table
        key="grouping-table"
        :addState="addState"
        :editState="editState"
        v-if="pageState == 1"
      />
      <add-new-group
        key="add-new-group"
        v-else-if="pageState == 2"
        :backToMain="backToMain"
      />
      <edit-grouping-data
        key="edit-new-group"
        :backToMain="backToMain"
        :editData="editData"
        v-else-if="pageState == 3"
      />
    </transition>
  </div>
</template>

<script>
export default {
  components: {
    groupingTable: () => import("./groupingTable"),
    addNewGroup: () => import("./addNewGroup"),
    editGroupingData: () => import("./editGroup"),
  },
  data: () => ({
    pageState: 1,
    editData: {},
  }),
  methods: {
    backToMain() {
      this.pageState = 1;
    },
    addState() {
      this.pageState = 2;
    },
    editState(value) {
      this.editData = value;
      this.pageState = 3;
    },
  },
};
</script>

<style lang="scss">
</style>