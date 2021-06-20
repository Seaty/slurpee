<template>
  <vx-card :title="$t('video_setting', { value: selectData.g_id })">
    <vs-popup
      :title="
        $t('sample_video', { value: showVideo ? showVideo.filename : '' })
      "
      :active.sync="sampleModal"
    >
      <div class="vx-row">
        <div class="vx-col w-full" v-if="sampleModal">
          <video width="100%" height="auto" controls>
            <source :src="host + 'load_video_by_var2/' + showVideo.v_id" />
          </video>
        </div>
      </div>
    </vs-popup>
    <div class="flex vx-row mt-2">
      <div class="vx-col w-full">
        <h5>{{ $t("upload_section") }}</h5>
      </div>
    </div>
    <div class="flex vx-row mt-4">
      <div class="vx-col md:w-1/4 w-full">
        <span>{{ $t("video_file") }}</span>
      </div>
      <div class="vx-col md:w-1/4 w-full">
        <input
          type="file"
          @change="getFile($event.target.files)"
          accept="video/*"
        />
      </div>
    </div>
    <div class="flex vx-row mt-5">
      <div class="vx-col w-full">
        <vs-table stripe :data="uploadList">
          <template slot="thead">
            <vs-th>#</vs-th>
            <vs-th>{{ $t("filename") }}</vs-th>
            <vs-th>{{ $t("delete") }}</vs-th>
          </template>
          <template slot-scope="{ data }">
            <vs-tr :data="item" :key="index" v-for="(item, index) of data">
              <vs-td>
                {{ index + 1 }}
              </vs-td>
              <vs-td>
                {{ item.name }}
              </vs-td>
              <vs-td>
                <vs-button
                  radius
                  color="danger"
                  type="filled"
                  icon-pack="feather"
                  icon="icon-trash-2"
                  @click="removeFileList(index)"
                />
              </vs-td>
            </vs-tr>
          </template>
        </vs-table>
      </div>
    </div>
    <div class="flex flex-wrap mt-3">
      <vs-button
        class="mt-4 shadow-lg"
        color="#ea4cc1"
        type="filled"
        @click="uploadVideo"
        >{{ $t("upload_all") }}
      </vs-button>
    </div>
    <div class="flex vx-row mt-5">
      <div class="vx-col w-full">
        <h5>{{ $t("video_selection") }}</h5>
      </div>
    </div>
    <div class="vx-row mt-4">
      <div class="vx-col md:w-1/6 w-full">
        <span>{{ $t("time_selected") }}</span>
      </div>
      <div class="vx-col md:w-1/6">
        <v-select v-model="selectTime" :options="timeOption" />
      </div>
    </div>
    <div class="flex vx-row mt-5">
      <div class="vx-col w-full">
        <h5>{{ $t("video_of_time", { time: selectTime }) }}</h5>
      </div>
    </div>
    <template v-if="selectTime">
      <div class="flex vx-row mt-5">
        <div class="vx-col md:w-1/2 w-full">
          <div class="flex vx-row">
            <div class="vx-col md:w-1/3 w-full">
              <span>{{ $t("video_selected") }}</span>
            </div>
            <div class="vx-col md:w-1/3">
              <v-select
                multiple
                label="filename"
                v-model="selectedVideo"
                :options="videoList"
              />
            </div>
          </div>
        </div>

        <div class="vx-col md:w-1/2 w-full">
          <vs-table stripe :data="selectedVideo">
            <template slot="thead">
              <vs-th>#</vs-th>
              <vs-th>{{ $t("filename") }}</vs-th>
              <vs-th></vs-th>
            </template>

            <template slot-scope="{ data }">
              <vs-tr :data="item" :key="index" v-for="(item, index) of data">
                <vs-td>
                  {{ index + 1 }}
                </vs-td>
                <vs-td>
                  {{ item.filename }}
                </vs-td>
                <vs-td>
                  <span class="flex">
                    <vs-button
                      @click="watchSampleVideo(item)"
                      radius
                      color="#82d4f5"
                      type="filled"
                      icon-pack="feather"
                      icon="icon-eye"
                    />
                    &nbsp;
                    <vs-button
                      radius
                      color="danger"
                      type="filled"
                      icon-pack="feather"
                      icon="icon-trash-2"
                      @click="removeVdo(item.v_id)"
                    />
                  </span>
                </vs-td>
              </vs-tr>
            </template>
          </vs-table>
        </div>
      </div>
    </template>

    <div class="flex flex-wrap mt-5">
      <vs-button
        class="mt-4 shadow-lg mr-4"
        color="#bfbfbf"
        type="filled"
        @click.native="backToMain"
        >{{ $t("cancel") }}
      </vs-button>
      <vs-button
        class="mt-4"
        type="filled"
        color="success"
        @click="createSchedule"
      >
        {{ $t("save") }}
      </vs-button>
    </div>
  </vx-card>
</template>

<script>
export default {
  name: "upload-video-step",
  props: {
    backToMain: {
      type: Function,
    },
    selectData: {
      type: Object,
    },
    timeSetting: {
      type: Object,
    },
  },
  data: () => ({
    uploadList: [],
    videoList: [],
    timeOption: [],
    selectTime: null,
    selectVideoData: {},
    selectedVideo: [],
    sampleModal: false,
    showVideo: null,
  }),
  mounted() {
    this.timeOption = this.timeSetting.timeData.map((x) => {
      this.selectVideoData[`${x.time_from}-${x.time_to}`] = [];
      return `${x.time_from}-${x.time_to}`;
    });
  },
  methods: {
    getFile(files) {
      var file_name = files[0].name.toLowerCase().replace(/\s/g, "");
      if (file_name.includes(".mp4") || file_name.includes(".mov")) {
        this.uploadList.push(files[0]);
      } else {
        this.uploadList.push(files[0]);
      }
    },
    removeFileList(index) {
      this.uploadList.splice(index, 1);
    },
    removeVdo(v_id) {
      this.selectedVideo = this.selectedVideo.filter((x) => x.v_id != v_id);
    },
    async createSchedule() {
      console.log(this.selectData);
      console.log(this.timeSetting);
      console.log(this.selectVideoData);
      //filter empty time
      let keys = Objects.keys(this.selectVideoData);
      keys.map((x) => {
        if (this.selectVideoData[x].length == 0) {
          delete this.selectVideoData[x];
        } else {
          this.selectVideoData[x].map((x) => x.v_id);
        }
      });
      let body = {
        g_id: this.selectData.g_id,
        date_start: this.timeSetting.fromDate,
        date_end: this.timeSetting.toDate,
        times: this.timeSetting.timeData,
        videos: this.selectVideoData,
      };
      console.log(body);
      
    },
    watchSampleVideo(item) {
      this.showVideo = item;
      this.sampleModal = true;
    },
    async uploadVideo() {
      let formData = new FormData();
      this.uploadList.forEach((x) => {
        formData.append("file", x);
      });
      this.$store.dispatch("openLoading");
      let result = await this.postMethodWithFile(
        "/upload_video_multi2",
        formData,
        { g_id: this.selectData.g_id }
      );
      this.$store.dispatch("closeLoading");
      debugger;
      if (!result.code) {
        this.getVdoArr();
        this.uploadList = [];
        // this.videoList = result.data;
      } else {
        this.$swal({
          title: this.$t(returnData.message + "_title"),
          text: this.$t(returnData.message + "_text"),
          icon: "error",
        });
      }
      // this.videoList = this.uploadList.map((x) => x.name);
    },
    async getVdoArr() {
      try {
        this.$store.dispatch("openLoading");
        let result = await this.getMethod("/get_all_vms");
        this.$store.dispatch("closeLoading");
        if (result.code) {
          return this.$swal({
            title: this.$t("error"),
            icon: "error",
            text: result.message,
          });
        }
        this.videoList = result.data;
        console.log(result);
      } catch (error) {
        this.$swal({
          title: this.$t("error"),
          icon: "error",
          text: error,
        });
      }
    },
  },
  watch: {
    selectTime(val) {
      this.getVdoArr();
      this.selectedVideo = this.selectVideoData[val];
    },
    selectedVideo(val) {
      this.selectVideoData[this.selectTime] = val;
    },
    sampleModal(val) {
      if (!val) {
        this.showVideo = null;
      }
    },
  },
};
</script>