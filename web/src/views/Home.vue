<template>
  <div id="dashboard-slurpee">
    <div class="vx-row">
      <div class="vx-col w-full lg:w-1/2 mb-base">
        <div class="vx-row">
          <div class="vx-col w-full mb-base">
            <vx-card :title="$t('eq_summary')">
              <!-- CHART -->
              <template slot="no-body">
                <div class="mt-10">
                  <vue-apex-charts
                    v-if="pieChart.series.length > 0"
                    type="pie"
                    height="500"
                    :options="pieChart.chartOptions"
                    :series="pieChart.series"
                  ></vue-apex-charts>
                </div>
              </template>

              <!-- DATA -->
              <div
                class="flex justify-between text-center"
                slot="no-body-bottom"
              >
                <div
                  class="w-1/2 border border-solid d-theme-border-grey-light border-r-0 border-b-0 border-l-0"
                >
                  <p class="mt-4">{{ $t("online") }}</p>
                  <p class="mb-4 text-3xl font-semibold">
                    {{ onlineCount }}
                  </p>
                </div>
                <div
                  class="w-1/2 border border-solid d-theme-border-grey-light border-r-0 border-b-0"
                >
                  <p class="mt-4">{{ $t("offline") }}</p>
                  <p class="mb-4 text-3xl font-semibold">{{ offlineCount }}</p>
                </div>
              </div>
            </vx-card>
          </div>
        </div>
        <!-- <div class="vx-row">
          <vx-card :title="$t('eq_table')">
            <vs-table
              search
              :data="eqData | equipmentFilter(selectedGroup)"
              maxHeight="200px"
            >
              <template slot="thead">
                <vs-th>{{ $t("eq_id") }}</vs-th>
                <vs-th>{{ $t("status") }}</vs-th>
                <vs-th>{{ $t("place_detail") }}</vs-th>
              </template>

              <template slot-scope="{ data }">
                <vs-tr :key="indextr" v-for="(item, indextr) of data">
                  <vs-td :data="item.eq_id">
                    {{ eq_text(item) }}
                  </vs-td>
                  <vs-td :data="item.status">
                    <span class="flex items-center px-2 py-1 rounded"
                      ><div
                        class="h-5 w-5 rounded-full mr-2"
                        :class="bgStatus(item.status)"
                      ></div>
                      {{ textStatus(item.status) }}</span
                    >
                  </vs-td>
                  <vs-td :data="item.place_detail">
                    <span>{{ item.place_detail }}</span>
                  </vs-td>
                </vs-tr>
              </template>
            </vs-table>
          </vx-card>
        </div> -->
      </div>
      <div class="vx-col w-full lg:w-1/2">
        <vx-card :title="$t('map_card')">
          <div class="vx-row">
            <div class="vx-col w-full mb-base">
              <div class="flex justify-between flex-wrap">
                <v-select
                  v-model="selectedGroup"
                  label="g_name"
                  :placeholder="$t('group_filter')"
                  :options="groupArr"
                  style="width: 200px"
                ></v-select>
                <span class="flex flex-wrap">
                  <vs-input
                    style="width: 200px"
                    :placeholder="$t('search_location')"
                    v-model="placeSearch"
                  />&nbsp;
                  <vs-button
                    color="#0288d1"
                    type="filled"
                    icon-pack="feather"
                    icon="icon-search"
                    @click="searchLocation"
                    :disabled="!placeSearch"
                  ></vs-button>
                </span>
              </div>
            </div>
          </div>
          <l-map
            ref="myMap"
            :zoom="zoom"
            :center="center"
            style="height: 500px; width: 100%"
            @ready="onReadyMap"
          >
            <l-wms-tile-layer
              :baseUrl="deemapUrl"
              layerType="base"
              :visible="true"
              :format="mapOptions.format"
              :layers="mapOptions.layers"
              :transparent="mapOptions.transparent"
              :version="mapOptions.version"
              :attribution="mapOptions.attribution"
            />
            <l-marker
              v-for="mitem of markerData"
              :key="mitem.eq_id"
              :lat-lng="[mitem.lat, mitem.lon]"
            >
              <l-icon
                :iconSize="[32, 32]"
                :iconAnchor="[15, 10]"
                :iconUrl="
                  require(`@/assets/images/marker/${imageStatus(
                    mitem.status
                  )}.png`)
                "
              >
              </l-icon>
              <l-popup>
                {{ eq_text(mitem) }}
              </l-popup>
            </l-marker>
          </l-map>
        </vx-card>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
export default {
  data: () => ({
    zoom: 12,
    center: [13.7563, 100.5018],
    placeSearch: null,
    eqData: [],
    selectedGroup: null,
    groupArr: [],
    onlineCount: null,
    pieChart: {
      series: [],
      chartOptions: {
        labels: [],
        colors: ["#689f38", "#ED1C24", "#BFBFBF"],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 220,
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
      },
    },
    interval: null,
  }),
  created() {
    this.getEquipmentData();
    this.interval = setInterval(() => {
      this.getEquipmentData();
    }, 30000);
    this.getGroupData();
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    onReadyMap() {
      this.map = this.$refs.myMap.mapObject;
      console.log(this.map);
    },
    eq_text(item) {
      return `${item.eq_id} (${item.remark})`;
    },
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
              ? -1
              : 1;
          } else {
            x["status"] = 0;
          }
          return x;
        });
        let online = this.eqData.filter((x) => x.status == 1).length;
        let offline = this.eqData.filter((x) => x.status == -1).length;
        let noStatus = this.eqData.filter((x) => x.status == 0).length;
        this.onlineCount = online;
        let statusArr = [1, -1, 0];
        this.pieChart.chartOptions.labels = [
          this.$t("online"),
          this.$t("offline"),
          this.$t("no_status"),
        ];

        this.pieChart.series = [online, offline, noStatus];
      }
    },
    async getGroupData() {
      let result = await this.getMethod("/get_group_master");
      if (!result.code) {
        this.groupArr = result.data;
      }
    },
    async searchLocation() {
      this.$store.dispatch("openLoading");
      let result = await this.getLatLngFromName(this.placeSearch);
      this.$store.dispatch("closeLoading");
      if (result) {
        this.center = [result.LAT, result.LON];
      } else {
        this.$vs.notify({
          title: this.$t("search_failed_title"),
          text: this.$t("search_failed_text"),
          color: "warning",
          position: "top-right",
        });
      }
    },
  },
  filters: {
    equipmentFilter(value, selectedGroup) {
      if (selectedGroup) {
        value = value.filter((x) => selectedGroup.eq_list.includes(x.eq_id));
      }
      return value;
    },
  },
  computed: {
    offlineCount() {
      if (this.onlineCount != null && this.eqData.length) {
        return this.eqData.length - this.onlineCount;
      }
      return "";
    },
    markerData() {
      if (this.selectedGroup) {
        return this.eqData.filter((x) =>
          this.selectedGroup.eq_list.includes(x.eq_id)
        );
      }
      return this.eqData;
    },
  },
  watch: {
    selectedGroup(val) {
      let temp = this.markerData[0];
      console.log(this.map.setView([temp.lat, temp.lon], this.zoom));
    },
  },
};
</script>

<style lang="scss">
.bg-none {
  background-color: #bfbfbf;
}
.leaflet-top {
  z-index: 500 !important;
}
</style>