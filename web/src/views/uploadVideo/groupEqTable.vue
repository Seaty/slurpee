<template >
  <vx-card :title="$t('eq_group_with_video')">
    <div class="vx-row">
      <div class="vx-col w-full">
        <vs-table search stripe :data="groupData">
          <template slot="thead">
            <vs-th>#</vs-th>
            <vs-th>{{ $t("g_id") }}</vs-th>
            <vs-th>{{ $t("g_name") }}</vs-th>
            <vs-th>{{ $t("video_count") }}</vs-th>
            <vs-th>{{ $t("edit") }}</vs-th>
            <!-- <vs-th>{{ $t("delete") }}</vs-th> -->
          </template>

          <template slot-scope="{ data }">
            <vs-tr :data="item" :key="index" v-for="(item, index) of data">
              <vs-td>
                {{ index + 1 }}
              </vs-td>
              <vs-td>{{ item.g_id }}</vs-td>
              <vs-td>{{ item.g_name }}</vs-td>
              <vs-td>{{ item.v_list ? item.v_list.length : "-" }}</vs-td>
              <vs-td>
                <vs-button
                  radius
                  color="warning"
                  type="filled"
                  icon-pack="feather"
                  icon="icon-edit"
                  @click.native="editState(item)"
                />
              </vs-td>
              <!-- <vs-td>
                <vs-button
                  radius
                  color="danger"
                  type="filled"
                  icon-pack="feather"
                  icon="icon-trash-2"
                  @click="deleteVideo(item)"
                />
              </vs-td> -->
            </vs-tr>
          </template>
        </vs-table>
      </div>
    </div>
  </vx-card>
</template>

<script >
export default {
  props: {
    editState: {
      type: Function,
    },
  },
  data: () => ({
    groupData: [],
  }),
  created() {
    this.getGroupwithVideo();
  },
  methods: {
    async getGroupwithVideo() {
      this.$store.dispatch("openLoading");
      let result = await this.getMethod("/get_group_with_video");
      this.$store.dispatch("closeLoading");
      if (!result.code) {
        // result.data.forEach((x) => {
        //   x.vdo_arr = x.vdo_arr.filter((y) => y != null);
        // });
        this.groupData = result.data;
      }
    },
    async deleteVideo(value) {
    },
  },
};
</script>