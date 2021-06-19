<template>
  <vx-card :title="$t('edit_device_group', { group_name: editData.g_id })">
    <div class="vx-row">
      <div class="vx-col sm:w-1/3 w-full">
        <span>{{ $t("g_name") }}</span>
      </div>
      <div class="vx-col sm:w-2/3 w-full">
        <vs-input class="w-full" v-model="g_name" />
      </div>
    </div>
    <div class="vx-row mt-4">
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
        :disabled="selected.length == 0"
        @click="editGroupData"
        >{{ $t("save") }}</vs-button
      >
    </div>
  </vx-card>
</template>

<script>
export default {
  name: "edit-grouping-data",
  props: {
    backToMain: {
      type: Function,
    },
    editData: {
      type: Object,
    },
  },
  data: () => ({
    list: [],
    selected: [],
    g_name: null,
  }),
  async created() {
    let result = await this.getMethod("/get_equipment_data");
    if (!result.code) {
      this.list = result.data.map((x) => ({
        value: x.eq_id,
        label: `${x.eq_id} ${x.place_detail} (${x.remark})`,
      }));
      this.selected = this.editData.eq_list;
      this.g_name = this.editData.g_name;
    }
  },
  methods: {
    async editGroupData() {
      let body = {
        eq_list: this.selected,
        g_name: this.g_name,
        g_id: this.editData.g_id,
      };
      this.$store.dispatch("openLoading");
      let r1 = await this.postMethod("/edit_group_data", body);
      this.$store.dispatch("closeLoading");
      console.log(r1);
      if (!r1.code) {
        this.$swal({
          title: this.$t("edit_group_complete"),
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        }).then(() => {
          this.backToMain();
        });
      }
    },
  },
};
</script>
