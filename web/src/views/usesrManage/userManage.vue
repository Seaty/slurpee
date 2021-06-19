<template>
  <div id="user-manage">
    <transition name="fade" mode="out-in">
      <user-table
        v-if="pageState == 1"
        :addState="addState"
        :editState="editState"
      />
      <add-new-user v-else-if="pageState == 2" :backToMain="backToMain" />
      <edit-user
        v-else-if="pageState == 3"
        :backToMain="backToMain"
        :editData="editData"
      />
    </transition>
  </div>
</template>

<script>
export default {
  components: {
    userTable: () => import("./userTable"),
    AddNewUser: () => import("./addNewUser"),
    EditUser: () => import("./editUser"),
  },
  data: () => ({
    pageState: 1,
    editData: null,
  }),
  methods: {
    addState() {
      this.pageState = 2;
    },
    editState(value) {
      this.pageState = 3;
      this.editData = value;
    },
    backToMain() {
      this.pageState = 1;
    },
  },
  watch: {
    pageState(val) {
      if (val == 1) {
        this.editData = null;
      }
    },
  },
};
</script>