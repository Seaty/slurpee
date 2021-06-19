<template>
  <vx-card :title="$t('add_new_eq')">
    <div class="flex">
      <div class="sm:w-1/2">
        <div class="vx-row mb-6">
          <div class="vx-col sm:w-1/3 w-full">
            <span>{{ $t("eq_id") }}</span>
          </div>
          <div class="vx-col sm:w-2/3 w-full">
            <validation-provider
              :name="$t('eq_id')"
              rules="required"
              v-slot="{ errors }"
            >
              <vs-input
                class="w-full"
                v-model="eq_id"
                :danger="errors.length > 0"
              />
              <span class="text-danger text-sm">{{ errors[0] }}</span>
            </validation-provider>
          </div>
        </div>
        <div class="vx-row mb-6">
          <div class="vx-col sm:w-1/3 w-full">
            <span>{{ $t("place_detail") }}</span>
          </div>
          <div class="vx-col sm:w-2/3 w-full">
            <validation-provider
              :name="$t('place_detail')"
              rules="required"
              v-slot="{ errors }"
            >
              <vs-input
                class="w-full"
                :danger="errors.length > 0"
                v-model="place_detail"
              />
              <span class="text-danger text-sm">{{ errors[0] }}</span>
            </validation-provider>
          </div>
        </div>
        <div class="vx-row mb-6">
          <div class="vx-col sm:w-1/3 w-full">
            <span>{{ $t("remark") }}</span>
          </div>
          <div class="vx-col sm:w-2/3 w-full">
            <validation-provider
              :name="$t('remark')"
              rules="required"
              v-slot="{ errors }"
            >
              <vs-input
                class="w-full"
                :danger="errors.length > 0"
                v-model="remark"
              />
              <span class="text-danger text-sm">{{ errors[0] }}</span>
            </validation-provider>
          </div>
        </div>
        <div class="vx-row mb-6">
          <div class="vx-col sm:w-1/3 w-full">
            <span>{{ $t("location") }}</span>
          </div>
          <div class="vx-col sm:w-2/3 w-full">
            <div class="vx-row">
              <div class="vx-col sm:w-1/2 w-full">
                <validation-provider
                  :name="$t('lat')"
                  rules="required"
                  v-slot="{ errors }"
                >
                  <vs-input
                    class="w-full"
                    :placeholder="$t('lat')"
                    :danger="errors.length > 0"
                    v-model="lat"
                    readOnly
                  />
                  <span class="text-danger text-sm">{{ errors[0] }}</span>
                </validation-provider>
              </div>
              <div class="vx-col sm:w-1/2 w-full">
                <validation-provider
                  :name="$t('lon')"
                  rules="required"
                  v-slot="{ errors }"
                >
                  <vs-input
                    class="w-full"
                    :placeholder="$t('lon')"
                    :danger="errors.length > 0"
                    v-model="lon"
                    readOnly
                  />
                  <span class="text-danger text-sm">{{ errors[0] }}</span>
                </validation-provider>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Map Section -->
      <div class="sm:w-1/2 px-4">
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
          <l-marker v-if="markerLoc" :lat-lng="markerLoc"></l-marker>
        </l-map>
      </div>
    </div>
    <div class="flex flex-wrap">
      <vs-button
        class="mt-4 shadow-lg"
        color="#bfbfbf"
        type="filled"
        @click.native="backFn"
        >{{ $t("cancel") }}</vs-button
      >
      &nbsp;
      <vs-button class="mt-4" type="filled" color="success">{{
        $t("save")
      }}</vs-button>
    </div>
  </vx-card>
</template>

<script>
export default {
  name: "edit-eq",
  props: {
    backFn: {
      type: Function,
    },
    editData: {
      type: Object,
    },
  },
  data: () => ({
    map: null,
    eq_id: null,
    place_detail: null,
    remark: null,
    lat: null,
    lon: null,
    zoom: 16,
    center: [13.673197058185066, 100.6057333946228],
    markerLoc: null,
  }),
  created() {
    let temp = this.editData;
    this.eq_id = temp.eq_id;
    this.place_detail = temp.place_detail;
    this.remark = temp.remark;
    this.lat = temp.lat;
    this.lon = temp.lon;
    this.center = [temp.lat, temp.lon];
    this.markerLoc = [temp.lat, temp.lon];
  },
  methods: {
    onReadyMap() {
      this.map = this.$refs.myMap.mapObject;
      this.map.on("click", this.clickOnMap);
    },
    clickOnMap(e) {
      console.log(e.latlng);
      this.lat = e.latlng.lat;
      this.lon = e.latlng.lng;
      this.markerLoc = [e.latlng.lat, e.latlng.lng];
    },
    async updateEquipment(validate) {
      let result = await validate();
      if (result) {
        let body = {
          eq_id: this.eq_id,
          lat: this.lat,
          lon: this.lon,
          remark: this.remark,
          place_detail: this.place_detail,
        };
        this.$store.dispatch("openLoading");
        let r1 = await this.postMethod("/update_equipment", body);
        this.$store.dispatch("closeLoading");
        if (!r1.code) {
          this.$vs.notify({
            title: this.$t("update_eq_complete"),
            color: "success",
            position: "top-right",
          });
          setTimeout(this.backFn, 1000);
        }
      }
    },
  },
};
</script>