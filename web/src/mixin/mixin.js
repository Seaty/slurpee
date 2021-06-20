import moment from "moment";
import UserProvider from "../service/service_provider";

const serviceProvider = new UserProvider();

const mixin = {
  data: () => ({
    mapOptions: {
      layers: "DeeMap2_THA_Map_Night",
      format: "image/png8",
      transparent: true,
      version: "1.1.1",
      attribution:
        "DeeMap Version 2.20.0 - Copyright © 2018 - 2020 - Powered By Thai Digital Map"
    },
    params: {
      id: "deemapnigth"
    },
    deemapUrl: "https://www.deemap.com/DeeMap/gwc/service/wms",
    host: "http://localhost:3007/"
  }),
  methods: {
    dateFormat(date) {
      if (date) {
        return moment(date).format("YYYY-MM-DD HH:mm");
      }
      return "-";
    },
    dateFormat2(date) {
      return moment(date).format("YYYY-MM-DD");
    },
    async getMethod(servicename, queryValue = {}) {
      const returnData = await serviceProvider.getMethod(
        servicename,
        queryValue
      );
      if (returnData.code) {
        this.$vs.notify({
          title: this.$t("error"),
          text: this.$t(returnData.message),
          color: "danger",
          position: "top-right"
        });
      }
      return returnData;
    },
    async postMethod(servicename, body = {}, query = {}) {
      const returnData = await serviceProvider.postMethod(
        servicename,
        body,
        query
      );
      if (returnData.code) {
        this.$vs.notify({
          title: this.$t("error"),
          text: this.$t(returnData.message),
          color: "danger",
          position: "top-right"
        });
      }
      return returnData;
    },
    async postMethodWithFile(servicename, body = {}, query = {}) {
      const returnData = await serviceProvider.postMethodWithFile(
        servicename,
        body,
        query
      );
      if (returnData.code) {
        this.$swal({
          title: this.$t(returnData.message + "_title"),
          text: this.$t(returnData.message + "_text"),
          icon: "error"
        });
      }
      return returnData;
    },
    async getLatLngFromName(value) {
      const returnData = await serviceProvider.getLatLngFromName(value);
      if (returnData.code) {
        return false;
      }
      return returnData.data.length > 0 ? returnData.data[0] : null;
    },
    getvideolink(g_id, filename) {
      return `http://203.151.70.135:3007/load_video_by_var/${g_id}/${filename}`;
      // return `http://localhost:3007/load_video_by_var/${g_id}/${filename}`
    },
    bgStatus(value) {
      if (value == "1") {
        return "bg-success";
      } else if (value == "-1") {
        return "bg-danger";
      } else if (value == "0") {
        return "bg-none";
      }
    },
    textStatus(value) {
      if (value == "1") {
        return this.$t("online");
      } else if (value == "-1") {
        return this.$t("offline");
      } else if (value == "0") {
        return this.$t("no_status");
      }
    },
    imageStatus(value) {
      if (value == "1") {
        return "green";
      } else if (value == "-1") {
        return "red";
      } else if (value == "0") {
        return "grey";
      }
    }
  }
};

export default mixin;
