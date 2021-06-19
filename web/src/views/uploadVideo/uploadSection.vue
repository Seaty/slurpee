<template>
  <vx-card :title="$t('edit_video_group', { group_name: selectData.g_name })">
    <div class="vx-row">
      <div class="vx-col md:w-1/4 w-full">
        <span>{{ $t("video_file") }}</span>
      </div>
      <div class="vx-col md:w-1/4 w-full">
        <input
          type="file"
          ref="fileInput"
          @change="getFile($event.target.files)"
          accept="video/*"
        />
      </div>
    </div>
    <div class="flex vx-row mt-5">
      <div class="vx-col flex-1 w-full">
        <span>{{ $t("date_from") }}</span>
      </div>
      <div class="vx-col flex-1 w-full">
        <flat-pickr
          :config="configFromdateTimePicker"
          v-model="fromDate"
          @on-change="onFromChange"
        />
      </div>
      <div class="vx-col flex-1 w-full">
        <span>{{ $t("date_to") }}</span>
      </div>
      <div class="vx-col flex-1 w-full">
        <flat-pickr
          :config="configTodateTimePicker"
          v-model="toDate"
          @on-change="onToChange"
        />
      </div>
    </div>
    <div class="flex vx-row mt-4">
      <div class="vx-col w-1/6">
        <span>{{ $t("time_schedule") }}</span>
      </div>
      <div class="vx-col w-1/6">
        <vs-radio v-model="radios2" vs-value="time1">time1</vs-radio>
      </div>
      <div class="vx-col w-1/6">
        <vs-radio v-model="radios2" vs-value="time2">time2</vs-radio>
      </div>
          <div class="vx-col w-1/6">
        <vs-radio v-model="radios2" vs-value="time3">time3</vs-radio>
      </div>
      <div class="vx-col w-1/6">
        <vs-radio v-model="radios2" vs-value="time4">time4</vs-radio>
      </div>
    </div>
    <div class="flex justify-between flex-wrap">
      <vs-button
        class="mt-4"
        type="filled"
        color="#ea4cc1"
        @click="uploadVideo"
        :disabled="uploadStatus"
      >
        {{ $t("upload") }}
      </vs-button>
    </div>

    <div class="vx-row">
      <div class="vx-col w-full">
        <vs-table search stripe :data="videoData">
          <template slot="thead">
            <vs-th>#</vs-th>
            <vs-th>{{ $t("file_name") }}</vs-th>
            <vs-th>{{ $t("seq") }}</vs-th>
            <vs-th>{{ $t("start_date") }}</vs-th>
            <vs-th>{{ $t("end_date") }}</vs-th>
            <vs-th>{{ $t("time_upload") }}</vs-th>
            <vs-th>{{ $t("status") }}</vs-th>
            <vs-th>{{ $t("watch") }}</vs-th>
            <vs-th>{{ $t("delete") }}</vs-th>
          </template>

          <template slot-scope="{ data }">
            <vs-tr :data="item" :key="index" v-for="(item, index) of data">
              <vs-td>
                {{ index + 1 }}
              </vs-td>
              <vs-td :data="item.file_name">{{ item.file_name }}</vs-td>
              <vs-td :data="item.seq">
                {{ item.seq }}
                <template v-if="data.length > 1 && item.status" slot="edit">
                  <vs-select
                    :label="$t('seq')"
                    v-model="item.seq"
                    @input="changeSequnce($event, item)"
                    ref="seqSelectEdit"
                  >
                    <vs-select-item
                      :value="seqItem"
                      :text="seqItem"
                      v-for="(seqItem, indexs) of seqArr"
                      :key="indexs"
                    />
                  </vs-select>
                </template>
              </vs-td>
              <vs-td>{{ dateFormat2(item.start_date) }}</vs-td>
              <vs-td>{{ dateFormat2(item.end_date) }}</vs-td>
              <vs-td>{{ dateFormat(item.time_upload) }}</vs-td>
              <vs-td>
                <vs-switch
                  v-model="item.status"
                  color="#4fd2f9"
                  @click="changeStatus(item.status, item, index)"
                />
              </vs-td>
              <vs-td>
                <vs-button
                  radius
                  color="#4fd2f9"
                  type="filled"
                  icon-pack="feather"
                  icon="icon-video"
                  @click="getVideo(item)"
                />
              </vs-td>
              <vs-td>
                <vs-button
                  radius
                  color="danger"
                  type="filled"
                  icon-pack="feather"
                  icon="icon-trash-2"
                  @click="deleteVideo(item)"
                />
              </vs-td>
            </vs-tr>
          </template>
        </vs-table>
        <vs-popup
          fullscreen
          class="holamundo"
          :title="$t('sample_video')"
          :active.sync="videoModal"
        >
          <vs-row vs-type="flex" vs-justify="center">
            <vs-col
              vs-type="flex"
              vs-justify="center"
              vs-align="center"
              vs-w="12"
              v-if="showVideo"
            >
              <video controls>
                <source :src="showVideo" type="video/mp4" />
                บราวเซอร์ไม่รองรับไฟล์
              </video>
            </vs-col>
          </vs-row>
        </vs-popup>
      </div>
    </div>
    <div class="flex flex-wrap">
      <vs-button
        class="mt-4 shadow-lg"
        color="#bfbfbf"
        type="filled"
        @click.native="backToMain"
        >{{ $t("cancel") }}
      </vs-button>
    </div>
  </vx-card>
</template>

<script>
export default {
  name: "upload-section",
  props: {
    backToMain: {
      type: Function,
    },
    selectData: {
      type: Object,
    },
  },
  data: () => ({
    radios2: null,
    fromDate: null,
    toDate: null,
    configFromdateTimePicker: {
      minDate: new Date(),
      maxDate: null,
      locale: null,
    },
    configTodateTimePicker: {
      minDate: null,
      locale: null,
    },
    videoFiles: [],
    showVideo: null,
    videoModal: false,
    videoData: [],
    seqArr: [],
  }),
  created() {
    this.getVideoByGid();
  },
  methods: {
    getFile(files) {
      var file_name = files[0].name.toLowerCase().replace(/\s/g, "");
      if (file_name.includes(".mp4") || file_name.includes(".mov")) {
        // this.video = files;
        // this.downloadable = false;
        this.videoFiles = files;
        console.log(files.length);
      } else {
        this.videoFiles = files;
        console.log(files);
      }
    },
    getVideo(val) {
      this.showVideo = this.getvideolink(this.selectData.g_id, val.file_name);
      this.videoModal = true;
    },
    async changeStatus(value, row, index) {
      if (!value) {
        let seq_arr = this.videoData.map((x) => x.seq).filter((x) => x != null);
        let max = Math.max(...seq_arr) == -Infinity ? 0 : Math.max(...seq_arr);
        this.videoData[index].seq = max + 1;
        let temp = JSON.parse(JSON.stringify(this.videoData[index]));
        temp.status = !value;
        let body = {
          data: [temp],
          g_id: this.selectData.g_id,
        };
        this.$store.dispatch("openLoading");
        let result = await this.postMethod("/update_video_status", body);
        this.$store.dispatch("closeLoading");
      } else {
        let temp = this.videoData.map((x) => {
          if (x.seq != null && x.seq > row.seq) {
            x.seq--;
          } else if (x.seq == row.seq) {
            x.seq = null;
          }
          return x;
        });
        let temp2 = JSON.parse(JSON.stringify(temp));
        temp2[index].status = !value;
        let body = { data: temp2, g_id: this.selectData.g_id };
        this.$store.dispatch("openLoading");
        let result = await this.postMethod("/update_video_status", body);
        this.$store.dispatch("closeLoading");
        this.videoData = temp;
      }
    },
    async changeSequnce(event, row) {
      let newSeq = event;
      let oldSeq = this.$refs.seqSelectEdit[0].value;
      if (!(newSeq == oldSeq)) {
        if (oldSeq > newSeq) {
          let temp = this.videoData.map((x) => {
            if (x.v_id == row.v_id) {
              x.seq = newSeq;
            } else if (x.seq < oldSeq && x.seq > newSeq) {
              x.seq++;
            } else if (newSeq == x.seq) {
              x.seq++;
            } else if (oldSeq == x.seq) {
              x.seq++;
            }
            return x;
          });
          this.videoData = temp;
          this.$nextTick(() => {
            this.$refs.seqSelectEdit[0].value = newSeq;
          });
        } else if (newSeq > oldSeq) {
          let temp = this.videoData.map((x) => {
            if (x.v_id == row.v_id) {
              x.seq = newSeq;
            } else if (x.seq > oldSeq && x.seq < newSeq) {
              x.seq--;
            } else if (newSeq == x.seq) {
              x.seq--;
            } else if (oldSeq == x.seq) {
              x.seq--;
            }
            return x;
          });
          this.videoData = temp;
          this.$nextTick(() => {
            this.$refs.seqSelectEdit[0].value = newSeq;
          });
        }
        let body = { data: this.videoData, g_id: this.selectData.g_id };
        this.$store.dispatch("openLoading");
        let result = await this.postMethod("/update_video_status", body);
        this.$store.dispatch("closeLoading");
      }
    },
    onFromChange(selectedDates, dateStr) {
      this.$set(this.configTodateTimePicker, "minDate", dateStr);
    },
    onToChange(selectedDates, dateStr) {
      this.$set(this.configFromdateTimePicker, "maxDate", dateStr);
    },
    async getVideoByGid() {
      this.$store.dispatch("openLoading");
      let result = await this.getMethod("/get_video_by_gid", {
        g_id: this.selectData.g_id,
      });
      this.$store.dispatch("closeLoading");
      if (!result.code) {
        this.fromDate = null;
        this.toDate = null;
        this.videoFiles = [];
        this.$refs.fileInput.value = null;
        this.videoData = result.data;
        this.seqArr = Array.from(
          { length: result.data.length },
          (_, i) => i + 1
        );
      }
    },
    uploadVideo() {
      this.$swal({
        icon: "warning",
        title: this.$t("upload_confirm_title"),
        showCancelButton: true,
        cancelButtonText: this.$t("cancel"),
        confirmButtonText: this.$t("confirm"),
        confirmButtonColor: "#689f38",
      }).then(async (swalResult) => {
        if (swalResult.value) {
          let v_detail = { start_date: this.fromDate, end_date: this.toDate };
          let body = new FormData();
          body.append("vfile", this.videoFiles[0]);
          body.append("v_detail", JSON.stringify(v_detail));
          this.$store.dispatch("openLoading");
          let result = await this.postMethodWithFile(
            "/upload_new_video",
            body,
            { g_id: this.selectData.g_id }
          );
          this.$store.dispatch("closeLoading");
          if (!result.code) {
            this.$vs.notify({
              title: this.$t("update_eq_complete"),
              color: "success",
              position: "top-right",
            });
            this.getVideoByGid();
          }
        }
      });
    },
    async deleteVideo(value) {
      this.$swal({
        icon: "warning",
        title: this.$t("delete_video_title"),
        showCancelButton: true,
        cancelButtonText: this.$t("cancel"),
        confirmButtonText: this.$t("confirm"),
      }).then(async (result) => {
        if (result.value) {
          // delete api
          let body = { v_item: value };
          this.$store.dispatch("openLoading");
          let r1 = await this.postMethod("/delete_video", body);
          this.$store.dispatch("closeLoading");
          if (!r1.code) {
            this.$vs.notify({
              title: this.$t("delete_eq_complete"),
              color: "success",
              position: "top-right",
            });
          }
          this.getVideoByGid();
        }
      });
    },
  },
  computed: {
    uploadStatus() {
      return this.videoFiles.length == 0 || !this.fromDate || !this.toDate;
    },
  },
  watch: {
    videoModal(val) {
      if (!val) {
        this.showVideo = null;
      }
    },
    "item.seq"(val) {
      console.log(val);
    },
  },
};
</script>

<style lang="scss" scoped>
video {
  /* override other styles to make responsive */
  width: auto !important;
  max-height: 85vh !important;
}
.centerx {
  display: inline;
}
</style>