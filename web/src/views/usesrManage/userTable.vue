<template>
  <vx-card :title="$t('user_table')">
    <vs-table search stripe :data="userData">
      <template slot="header">
        <vs-button
          color="success"
          type="filled"
          icon-pack="feather"
          icon="icon-plus-square"
          @click.native="addState"
          >{{ $t("add_new_user") }}</vs-button
        >
      </template>
      <template slot="thead">
        <vs-th>#</vs-th>
        <vs-th>{{ $t("u_id") }}</vs-th>
        <vs-th>{{ $t("time_create") }}</vs-th>
        <vs-th>{{ $t("role") }}</vs-th>
        <vs-th>{{ $t("last_login") }}</vs-th>
        <vs-th>{{ $t("edit") }}</vs-th>
        <vs-th>{{ $t("delete") }}</vs-th>
      </template>

      <template slot-scope="{ data }">
        <vs-tr :key="indextr" v-for="(item, indextr) of data">
          <vs-td>
            {{ indextr + 1 }}
          </vs-td>
          <vs-td>
            {{ item.u_id }}
          </vs-td>
          <vs-td>
            {{ dateFormat(item.time_create) }}
          </vs-td>
          <vs-td>
            {{ roleText(item.role) }}
          </vs-td>
          <vs-td>
            {{ dateFormat(item.last_login) }}
          </vs-td>
          <vs-td>
            <vs-button
              radius
              color="warning"
              type="filled"
              icon-pack="feather"
              icon="icon-edit"
              @click="editState(item)"
            />
          </vs-td>
          <vs-td>
            <vs-button
              radius
              color="danger"
              type="filled"
              icon-pack="feather"
              icon="icon-trash-2"
              @click="deleteUser(item.u_id)"
            />
          </vs-td>
        </vs-tr>
      </template>
    </vs-table>
  </vx-card>
</template>

<script>
export default {
  props: {
    addState: {
      type: Function,
    },
    editState: {
      type: Function,
    },
  },
  data: () => ({
    userData: [],
  }),
  created() {
    this.getUserData();
  },
  methods: {
    async getUserData() {
      let result = await this.getMethod("/get_username_data");
      if (!result.code) {
        this.userData = result.data;
      }
    },
    roleText(role) {
      if (role == 1) {
        return this.$t("admin");
      } else {
        return this.$t("user");
      }
    },
    deleteUser(value) {
      this.$swal({
        icon: "warning",
        title: this.$t("delete_user_title"),
        showCancelButton: true,
        cancelButtonText: this.$t("cancel"),
        confirmButtonText: this.$t("confirm"),
        confirmButtonColor: "#EA5455",
      }).then(async (result) => {
        if (result.value) {
          let body = { user_id: value };
          this.$store.dispatch("openLoading");
          let r1 = await this.postMethod("/delete_user_data", body);
          this.$store.dispatch("closeLoading");
          if (!r1.code) {
            this.$vs.notify({
              title: this.$t("delete_user_complete"),
              color: "success",
              position: "top-right",
            });
            setTimeout(this.getUserData(), 1000);
          }
        }
      });
    },
  },
};
</script>