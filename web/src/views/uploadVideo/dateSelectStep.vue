<template>
  <vx-card :title="$t('datetime_setting', { value: selectData.g_id })">
    <div class="flex vx-row mt-2">
      <div class="vx-col w-full">
        <h5>{{ $t("select_date") }}</h5>
      </div>
    </div>
    <div class="flex vx-row mt-5">
      <div class="vx-col flex-1 w-full">
        <span>{{ $t("date_from") }}</span>
      </div>
      <div class="vx-col flex-1 w-full">
        <flat-pickr
          :config="configFromdateTimePicker"
          v-model="tempTimeSetting.fromDate"
          @on-change="onFromChange"
          :disabled="dataState > 0"
        />
      </div>
      <div class="vx-col flex-1 w-full">
        <span>{{ $t("date_to") }}</span>
      </div>
      <div class="vx-col flex-1 w-full">
        <flat-pickr
          :config="configTodateTimePicker"
          v-model="tempTimeSetting.toDate"
          @on-change="onToChange"
          :disabled="dataState > 0"
        />
      </div>
      <div class="vx-col flex-1 w-full" />
    </div>
    <template v-if="dataState > 0">
      <div class="flex vx-row mt-2">
        <div class="vx-col w-full">
          <h5>{{ $t("select_time") }}</h5>
        </div>
      </div>
      <div class="flex vx-row mt-5">
        <div class="vx-col flex-1 w-full">
          <span>{{ $t("time_start") }}</span>
        </div>
        <div class="vx-col flex-1 w-full">
          <flat-pickr
            :config="configTimeFrom"
            v-model="fromTime"
            @on-change="onTimefromChange"
          />
        </div>
        <div class="vx-col flex-1 w-full">
          <span>{{ $t("time_end") }}</span>
        </div>
        <div class="vx-col flex-1 w-full">
          <flat-pickr
            :config="configTimeTo"
            v-model="toTime"
            @on-change="onTimetoChange"
          />
        </div>
        <div class="vx-col flex-1 w-full">
          <vs-button
            class="shadow-lg"
            color="success"
            type="filled"
            @click="addTimeitem"
            >{{ $t("add") }}
          </vs-button>
        </div>
      </div>
      <div class="flex vx-row mt-5">
        <div class="vx-col w-full">
          <vs-table stripe :data="tempTimeSetting.timeData">
            <template slot="thead">
              <vs-th>#</vs-th>
              <vs-th>{{ $t("time") }}</vs-th>
              <vs-th>{{ $t("delete") }}</vs-th>
            </template>
            <template slot-scope="{ data }">
              <vs-tr :data="item" :key="index" v-for="(item, index) of data">
                <vs-td>
                  {{ index + 1 }}
                </vs-td>
                <vs-td>
                  {{ item.time_from + "-" + item.time_to }}
                </vs-td>
                <vs-td>
                  <vs-button
                    radius
                    color="danger"
                    type="filled"
                    icon-pack="feather"
                    icon="icon-trash-2"
                    @click="deleteTime(index)"
                  />
                </vs-td>
              </vs-tr>
            </template>
          </vs-table>
        </div>
      </div>
    </template>

    <div class="flex flex-wrap justify-between">
      <span>
        <vs-button
          class="mt-4 shadow-lg"
          color="#bfbfbf"
          type="filled"
          @click.native="backToMain"
          >{{ $t("cancel") }}
        </vs-button>
        &nbsp;
        <vs-button
          v-if="dataState > 0"
          class="mt-4 shadow-lg"
          color="#c6e2ff"
          type="filled"
          @click.native="previousState"
          >{{ $t("back") }}
        </vs-button>
      </span>

      <vs-button
        class="mt-4 shadow-lg"
        color="success"
        type="filled"
        @click.native="nextState"
        :disabled="nextDisabled"
        >{{ $t("next") }}
      </vs-button>
    </div>
  </vx-card>
</template>

<script>
import moment from "moment";

export default {
  name: "new-upload-section",
  props: {
    backToMain: {
      type: Function,
    },
    selectData: {
      type: Object,
    },
    value: {
      type: Object,
    },
    nextStep: {
      type: Function,
    },
  },
  data: () => ({
    dataState: 0,
    fromTime: null,
    toTime: null,
    configFromdateTimePicker: {
      minDate: moment().subtract(1, "day").toDate(),
      maxDate: null,
      locale: null,
    },
    configTodateTimePicker: {
      minDate: null,
      locale: null,
    },
    configTimeFrom: {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true,
      minTime: null,
      maxTime: null,
    },
    configTimeTo: {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true,
      minTime: null,
      maxTime: null,
    },
  }),
  mounted() {
    if (this.tempTimeSetting.fromDate && this.tempTimeSetting.toDate) {
      this.dataState = 1;
    }
  },
  methods: {
    onFromChange(selectedDates, dateStr) {
      this.$set(this.configTodateTimePicker, "minDate", dateStr);
    },
    onToChange(selectedDates, dateStr) {
      this.$set(this.configFromdateTimePicker, "maxDate", dateStr);
    },
    onTimefromChange(value1, value2) {
      if (!this.fromTime) {
        this.fromTime = "12:00";
        this.$set(this.configTimeTo, "minTime", "12:00");
      } else {
        this.$set(this.configTimeTo, "minTime", value2);
      }
    },
    onTimetoChange(value1, value2) {
      this.$set(this.configTimeFrom, "maxTime", value2);
    },
    previousState() {
      if (this.dataState == 0) {
        this.backToMain();
      } else {
        this.dataState--;
      }
    },
    addTimeitem() {
      let item = { time_from: this.fromTime, time_to: this.toTime };
      let checkDup = this.tempTimeSetting.timeData.filter(
        (x) => x.time_from == this.fromTime && x.time_to == this.toTime
      );
      if (checkDup.length > 0) {
        return this.$swal({
          icon: "warning",
          title: this.$t("time_duplicated"),
          confirmButtonText: this.$t("confirm"),
        });
      }
      this.tempTimeSetting.timeData.push(item);
      this.fromTime = null;
      this.toTime = null;
      this.$set(this.configTimeTo, "minTime", null);
      this.$set(this.configTimeFrom, "maxTime", null);
    },
    deleteTime(index) {
      this.tempTimeSetting.timeData.splice(index, 1);
    },
    async nextState() {
      if (this.dataState == 1) {
        this.nextStep();
      } else {
        this.$store.dispatch("openLoading");
        let r1 = await this.getMethod("/get_ads_data", {
          g_id: this.selectData.g_id,
          start_date: this.tempTimeSetting.fromDate,
          end_date: this.tempTimeSetting.toDate,
        });
        this.$store.dispatch("closeLoading");
        if (!r1.code) {
          this.tempTimeSetting.timeData = r1.data;
          this.dataState++;
        } else {
          this.$swal({
            icon: "error",
            title: this.$t("error"),
          });
        }
      }
    },
  },
  computed: {
    nextDisabled() {
      return (
        (this.dataState == 1 && this.tempTimeSetting.timeData.length == 0) ||
        (this.dataState == 0 &&
          (!this.tempTimeSetting.toDate || !this.tempTimeSetting.fromDate))
      );
    },
    tempTimeSetting: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
};
</script>