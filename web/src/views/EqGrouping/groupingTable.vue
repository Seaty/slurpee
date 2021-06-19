<template>
  <vx-card :title="$t('equipment_grouping_table')">
    <vs-table search stripe :data="groupData">
      <template slot="header">
        <vs-button
          color="success"
          type="filled"
          icon-pack="feather"
          icon="icon-plus-square"
          @click.native="addState"
          >{{ $t("add_new_eq") }}</vs-button
        >
      </template>
      <template slot="thead">
        <vs-th>#</vs-th>
        <vs-th>{{ $t("g_id") }}</vs-th>
        <vs-th>{{ $t("g_name") }}</vs-th>
        <vs-th>{{ $t("eq_length") }}</vs-th>
        <vs-th>{{ $t("last_config") }}</vs-th>
        <vs-th>{{ $t("edit") }}</vs-th>
        <vs-th>{{ $t("delete") }}</vs-th>
      </template>
      <template slot-scope="{ data }">
        <vs-tr :data="item" :key="index" v-for="(item, index) of data">
          <vs-td>
            {{ index + 1 }}
          </vs-td>
          <vs-td>{{ item.g_id }}</vs-td>
          <vs-td>{{ item.g_name }}</vs-td>
          <vs-td>{{ item.eq_list.length }}</vs-td>
          <vs-td>{{ dateFormat(item.last_config) }}</vs-td>
          <vs-td>
            <vs-button
              radius
              color="warning"
              type="filled"
              icon-pack="feather"
              icon="icon-edit"
              @click.native="editState(item)"
            />
          </vs-td>
          <vs-td>
            <vs-button
              radius
              color="danger"
              type="filled"
              icon-pack="feather"
              icon="icon-trash-2"
              @click="deleteEq(item.g_id)"
            />
          </vs-td>
        </vs-tr>
      </template>
    </vs-table>
  </vx-card>
</template>

<script>
export default {
  name: "grouping-table",
  props: {
    addState: {
      type: Function,
    },
    editState: {
      type: Function,
    },
  },
  data: () => ({
    groupData: [],
  }),
  created() {
    this.getGroupData();
  },
  methods: {
    async getGroupData() {
      let result = await this.getMethod("/get_group_master");
      if (!result.code) {
        this.groupData = result.data;
      }
    },
    deleteEq(value) {
      this.$swal({
        icon: "warning",
        title: this.$t("delete_group_title"),
        showCancelButton: true,
        cancelButtonText: this.$t("cancel"),
        confirmButtonText: this.$t("delete"),
        confirmButtonColor: "#d32f2f",
      }).then(async (result) => {
        if (result.value) {
          // delete api
          let body = { g_id: value };
          this.$store.dispatch("openLoading");
          let r1 = await this.postMethod("/delete_group_data", body);
          this.$store.dispatch("closeLoading");
          console.log(r1);
          if (!r1.code) {
            this.$swal({
              title: this.$t("delete_group_complete"),
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
              allowOutsideClick: false,
            }).then(() => {
              this.getGroupData();
            });
          }
        }
      });
    },
  },
};
</script>
