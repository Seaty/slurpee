<template>
  <vx-card :title="$t('equipment_master_data')">
    <vs-table search stripe :data="eqData">
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
        <vs-th>{{ $t("eq_id") }}</vs-th>
        <vs-th>{{ $t("lat") }}</vs-th>
        <vs-th>{{ $t("lon") }}</vs-th>
        <vs-th>{{ $t("last_config") }}</vs-th>
        <vs-th>{{ $t("place_detail") }}</vs-th>
        <vs-th>{{ $t("remark") }}</vs-th>
        <vs-th>{{ $t("edit") }}</vs-th>
        <vs-th>{{ $t("delete") }}</vs-th>
      </template>

      <template slot-scope="{ data }">
        <vs-tr :key="indextr" v-for="(tr, indextr) in data">
          <vs-td>
            {{ indextr + 1 }}
          </vs-td>
          <vs-td>
            {{ data[indextr].eq_id }}
          </vs-td>
          <vs-td>
            {{ data[indextr].lat }}
          </vs-td>
          <vs-td>
            {{ data[indextr].lon }}
          </vs-td>
          <vs-td>
            {{ dateFormat(data[indextr].last_config) }}
          </vs-td>
          <vs-td>
            {{ data[indextr].place_detail }}
          </vs-td>
          <vs-td>
            {{ data[indextr].remark }}
          </vs-td>
          <vs-td>
            <vs-button
              radius
              color="warning"
              type="filled"
              icon-pack="feather"
              icon="icon-edit"
              @click.native="editState(data[indextr])"
            />
          </vs-td>
          <vs-td>
            <vs-button
              radius
              color="danger"
              type="filled"
              icon-pack="feather"
              icon="icon-trash-2"
              @click="deleteEq(data[indextr].eq_id)"
            />
          </vs-td>
        </vs-tr>
      </template>
    </vs-table>
  </vx-card>
</template>

<script>
export default {
  name: "eq-table",
  props: {
    addState: {
      type: Function,
    },
    editState: {
      type: Function,
    },
  },
  created() {
    this.getTableData();
  },
  data: () => ({
    eqData: [],
  }),
  methods: {
    async getTableData() {
      let result = await this.getMethod("/get_equipment_data");
      if (!result.code) {
        this.eqData = result.data;
      }
    },
    deleteEq(value) {
      this.$swal({
        icon: "warning",
        title: this.$t("delete_eq_title"),
        showCancelButton: true,
        cancelButtonText: this.$t("cancel"),
        confirmButtonText: this.$t("confirm"),
      }).then(async (result) => {
        if (result.value) {
          // delete api
          let body = { eq_id: value };
          this.$store.dispatch("openLoading");
          let r1 = await this.postMethod("/delete_equipment", body);
          this.$store.dispatch("closeLoading");
          if (!r1.code) {
            this.$vs.notify({
              title: this.$t("delete_eq_complete"),
              color: "success",
              position: "top-right",
            });
            setTimeout(this.getTableData(),1000)
          }
        }
      });
    },
  },
};
</script>