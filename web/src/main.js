/*=========================================================================================
  File Name: main.js
  Description: main vue(js) file
  ----------------------------------------------------------------------------------------
  Item Name: Vuesax Admin - VueJS Dashboard Admin Template
  Author: Pixinvent
  Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/

import Vue from "vue";
import App from "./App.vue";

// Vuesax Component Framework
import Vuesax from "vuesax";
import "material-icons/iconfont/material-icons.css"; //Material Icons
import "vuesax/dist/vuesax.css"; // Vuesax
Vue.use(Vuesax);

// Theme Configurations
import "../themeConfig.js";

// Globally Registered Components
import "./globalComponents.js";

// Styles: SCSS
import "./assets/scss/main.scss";

// Tailwind
import "@/assets/css/main.css";

// Vue Router
import router from "./router";

// Vuex Store
import store from "./store/store";

// Vuesax Admin Filters
import "./filters/filters";

// Vuejs - Vue wrapper for hammerjs
import { VueHammer } from "vue2-hammer";
Vue.use(VueHammer);

//Vue leaflet
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});
import {
  LMap,
  LTileLayer,
  LMarker,
  LWMSTileLayer,
  LPopup,
  LIcon
} from "vue2-leaflet";
import "leaflet/dist/leaflet.css";

Vue.component("l-map", LMap);
Vue.component("l-tile-layer", LTileLayer);
Vue.component("l-marker", LMarker);
Vue.component("l-wms-tile-layer", LWMSTileLayer);
Vue.component("l-popup", LPopup);
Vue.component("l-icon", LIcon);

// PrismJS
import "prismjs";
import "prismjs/themes/prism-tomorrow.css";

// Feather font icon
require("./assets/css/iconfont.css");

// i18n
import i18n from "./i18n/i18n";

Vue.config.productionTip = false;

//Global
import mixin from "./mixin/mixin";
Vue.mixin(mixin);

//vue swal
import VueSweetalert2 from "vue-sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
Vue.use(VueSweetalert2);

//Vue select Sides
import vueSelectSides from "vue-select-sides";
import "vue-select-sides/styles/themes/dark.scss";
Vue.use(vueSelectSides);
Vue.component("vue-select-sides", vueSelectSides);

//Vee Validate
import {
  ValidationProvider,
  ValidationObserver,
  localize,
  extend
} from "vee-validate";
import * as rules from "vee-validate/dist/rules";
import en from "vee-validate/dist/locale/en.json";
import th from "vee-validate/dist/locale/th.json";
localize({ en, th });
localize("en");
Object.keys(rules).forEach(rule => {
  extend(rule, rules[rule]);
});
Vue.component("validation-provider", ValidationProvider);
Vue.component("validation-observer", ValidationObserver);

//flatPicker
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
Vue.component("flat-pickr", flatPickr);

//Vue Multiple select
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";
Vue.component("multiselect", Multiselect);

import vSelect from "vue-select";
Vue.component("v-select", vSelect);

//vue loading overlay
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
Vue.component("loading", Loading);

//vue-apexcharts
import VueApexCharts from "vue-apexcharts";
Vue.component("vue-apex-charts", VueApexCharts);

//v-movable
import movable from "v-movable";
Vue.use(movable);

// ACL
import acl from "./acl/acl";

new Vue({
  router,
  store,
  i18n,
  acl,
  render: h => h(App)
}).$mount("#app");
