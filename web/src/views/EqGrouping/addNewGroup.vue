<template>
  <vx-card :title="$t('add_new_group')">
    <div class="vx-row">
      <div class="vx-col sm:w-full">
        <vue-select-sides
          type="mirror"
          v-model="selected"
          placeholder-search-left="All equipment"
          placeholder-search-right="Selected Equipment"
          :list="list"
        ></vue-select-sides>
      </div>
    </div>
    <div class="flex flex-wrap">
      <vs-button
        class="mt-4 shadow-lg"
        color="#bfbfbf"
        type="filled"
        @click.native="backToMain"
        >{{ $t("cancel") }}</vs-button
      >
      &nbsp;
      <vs-button
        class="mt-4"
        type="filled"
        color="success"
        @click="addNewGroup"
        :disabled="selected.length == 0"
        >{{ $t("save") }}</vs-button
      >
    </div>
  </vx-card>
</template>

<script>
export default {
  name: "add-new-group",
  props: {
    backToMain: {
      type: Function,
    },
  },
  data: () => ({
    selected: [],
    list: [
      // { value: "eq-00001", label: "eq-00001" },
      // { value: "eq-00002", label: "eq-00002" },
      // { value: "eq-00003", label: "eq-00003" },
      // { value: "eq-00004", label: "eq-00004" },
      // { value: "eq-00005", label: "eq-00005" },
      // { value: "eq-00006", label: "eq-00006" },
      // { value: "eq-00007", label: "eq-00007" },
    ],
  }),
  created() {
    this.getAllEquipment();
  },
  methods: {
    async getAllEquipment() {
      let result = await this.getMethod("/get_equipment_data");
      if (!result.code) {
        this.list = result.data.map((x) => ({
          value: x.eq_id,
          label: `${x.eq_id} ${x.place_detail} (${x.remark})`,
        }));
      }
    },
    addNewGroup() {
      this.$swal({
        title: this.$t("enter_group_name_title"),
        input: "text",
        inputAttributes: {
          autocapitalize: "off",
        },
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        confirmButtonText: this.$t("confirm"),
        showLoaderOnConfirm: true,
        preConfirm: (groupName) => {
          return new Promise((resolve, reject) => {
            if (groupName) {
              resolve();
            } else {
              reject("Group name is require!");
            }
          })
            .then((result) => {
              console.log("Pass");
              return result;
            })
            .catch((error) => {
              this.$swal.showValidationMessage(`Request failed: ${error}`);
            });
        },
        allowOutsideClick: () => !this.$swal.isLoading(),
      }).then(async (result) => {
        if (result.value) {
          let body = { eq_list: this.selected, g_name: result.value };
          this.$store.dispatch("openLoading");
          let r1 = await this.postMethod("/add_new_group", body);
          this.$store.dispatch("closeLoading");
          console.log(r1);
          if (!r1.code) {
            this.$swal({
              title: this.$t("add_group_complete"),
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
              allowOutsideClick: false,
            }).then(() => {
              this.backToMain();
            });
          }
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.vss {
  height: 300px;
}
</style>