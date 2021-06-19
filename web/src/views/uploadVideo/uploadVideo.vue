<template>
  <div id="video-upload">
    <transition name="fade" mode="out-in">
      <groupEqTable v-if="pageState == 1" :editState="editState" />
      <date-select-step
        v-else-if="pageState == 2"
        :selectData="selectData"
        :backToMain="backToMain"
        :nextStep="nextStep"
        v-model="timeSetting"
      />
      <upload-video-step
        v-else-if="pageState == 3"
        :selectData="selectData"
        :backToMain="backToMain"
        :timeSetting="timeSetting"
      />
    </transition>
  </div>
</template>

<script>
export default {
  components: {
    dateSelectStep: () => import("./dateSelectStep"),
    groupEqTable: () => import("./groupEqTable.vue"),
    uploadVideoStep: () => import("./uploadVideoStep"),
  },
  data: () => ({
    pageState: 1,
    selectData: {},
    timeSetting: {
      fromDate: null,
      toDate: null,
      timeData: [],
    },
  }),
  methods: {
    editState(val) {
      this.selectData = val;
      this.pageState = 2;
    },
    backToMain() {
      this.pageState--;
    },
    nextStep() {
      this.pageState = 3;
    },
  },
};
</script>
