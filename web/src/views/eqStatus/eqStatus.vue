<template>
  <vx-card :title="$t('equipment_status')">
    <div slot="no-body" class="mt-4 p-2">
      <vs-table search :data="eqData">
        <template slot="thead">
          <vs-th>#</vs-th>
          <vs-th>{{ $t("eq_id") }}</vs-th>
          <vs-th>{{ $t("status") }}</vs-th>
          <vs-th>{{ $t("place_detail") }}</vs-th>
          <vs-th>{{ $t("time_update") }}</vs-th>
        </template>

        <template slot-scope="{ data }">
          <vs-tr :key="indextr" v-for="(item, indextr) of data">
            <vs-td :data="indextr">
              <span>{{ indextr + 1 }}</span>
            </vs-td>
            <vs-td :data="item.eq_id">
              <span>{{ item.eq_id }}</span>
            </vs-td>
            <vs-td :data="item.status">
              <span class="flex items-center px-2 py-1 rounded"
                ><div
                  class="h-3 w-3 rounded-full mr-2"
                  :class="bgStatus(item.status)"
                ></div>
                {{ textStatus(item.status) }}</span
              >
            </vs-td>
            <vs-td :data="item.place_detail">
              <span>{{ item.place_detail }}</span>
            </vs-td>
            <vs-td :data="item.last_update">
              <span>{{ dateFormat(item.last_update) }}</span>
            </vs-td>
          </vs-tr>
        </template>
      </vs-table>
    </div>
  </vx-card>
</template>

<script>
import moment from "moment";

export default {
  data: () => ({
    eqData: [],
    interval: null,
  }),
  created() {
    this.getEquipmentData();
    this.interval = setInterval(() => {
      this.getEquipmentData();
    }, 30000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    async getEquipmentData() {
      this.$store.dispatch("openLoading");
      let result = await this.getMethod("/get_equipment_data");
      this.$store.dispatch("closeLoading");
      if (!result.code) {
        this.eqData = result.data.map((x) => {
          let timeCheck = moment().subtract(15, "minutes");
          if (x.last_update) {
            x["status"] = moment(x.last_update).isBefore(
              moment(timeCheck),
              "second"
            )
              ? "-1"
              : "1";
          } else {
            x["status"] = 0;
          }
          return x;
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.bg-none {
  background-color: #bfbfbf;
}
</style>