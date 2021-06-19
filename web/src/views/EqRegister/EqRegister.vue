<template>
  <div id="equipment-register-layout">
    <transition name="fade" mode="out-in">
      <eq-table
        ref="eqTable"
        key="eq-table"
        v-if="pageState == 1"
        :addState="addState"
        :editState="editState"
      />
      <add-eq key="add-eq" v-else-if="pageState == 2" :backFn="backToMain" />
      <edit-eq
        key="add-eq"
        v-else-if="pageState == 3"
        :backFn="backToMain"
        :editData="editData"
      />
    </transition>
  </div>
</template>

<script>
export default {
  components: {
    EqTable: () => import("./eqtable"),
    AddEq: () => import("./addEq"),
    EditEq: () => import("./editEq"),
  },
  data: () => ({
    pageState: 1,
    editData: null,
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
  watch: {
    pageState(val) {
      if (val == 1) {
        //initData
        this.editData = null;
      }
    },
  },
};
</script>

<style lang="scss">
@import "@/assets/scss/slurpee/eqRegister/eqRegister.scss";
</style>