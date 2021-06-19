<template>
  <vx-card :title="$t('edit_user')">
    <div class="vx-row">
      <div class="vx-col w-full">
        <vs-tabs>
          <vs-tab :label="$t('edit_role')">
            <validation-observer v-slot="{ validate }">
              <div class="vx-row p-4">
                <div class="vx-col sm:w-1/2 w-full">
                  <div class="vx-row mb-6 mt-2">
                    <div class="vx-col sm:w-1/3 w-full">
                      <span>{{ $t("role") }}</span>
                    </div>
                    <div class="vx-col sm:w-2/3 w-full">
                      <validation-provider
                        :name="$t('role')"
                        rules="required"
                        v-slot="{ errors }"
                      >
                        <vs-select
                          v-model="editRole"
                          :danger="errors.length > 0"
                          class="w-full"
                        >
                          <vs-select-item
                            :key="index"
                            :value="item.value"
                            :text="item.text"
                            v-for="(item, index) in roleArr"
                            class="w-full"
                          />
                        </vs-select>
                        <span class="text-danger text-sm">{{ errors[0] }}</span>
                      </validation-provider>
                    </div>
                  </div>
                  <div class="flex flex-wrap">
                    <vs-button
                      class="mt-4 shadow-lg"
                      color="#bfbfbf"
                      type="filled"
                      @click.native="backToMain"
                      >{{ $t("cancel") }}</vs-button
                    >
                    &nbsp;
                    <vs-button
                      class="mt-4 shadow-lg ml-4"
                      color="success"
                      type="filled"
                      @click="updateRole(validate)"
                      >{{ $t("update") }}</vs-button
                    >
                  </div>
                </div>
              </div>
            </validation-observer>
          </vs-tab>
          <vs-tab :label="$t('edit_password')">
            <validation-observer v-slot="{ validate }">
              <div class="vx-row p-4">
                <div class="vx-col sm:w-1/2 w-full">
                  <div class="vx-row mb-6">
                    <div class="vx-col sm:w-1/3 w-full">
                      <span>{{ $t("old_password") }}</span>
                    </div>
                    <div class="vx-col sm:w-2/3 w-full">
                      <validation-provider
                        :name="$t('password')"
                        rules="required|min:6"
                        v-slot="{ errors }"
                        vid="confirmation"
                      >
                        <vs-input
                          class="w-full"
                          type="password"
                          :danger="errors.length > 0"
                          v-model="password"
                        />
                        <span class="text-danger text-sm">{{ errors[0] }}</span>
                      </validation-provider>
                    </div>
                  </div>
                  <div class="vx-row mb-6">
                    <div class="vx-col sm:w-1/3 w-full">
                      <span>{{ $t("confirm_pass") }}</span>
                    </div>
                    <div class="vx-col sm:w-2/3 w-full">
                      <validation-provider
                        :name="$t('confirm_pass')"
                        rules="required|min:6|confirmed:confirmation"
                        v-slot="{ errors }"
                      >
                        <vs-input
                          class="w-full"
                          type="password"
                          :danger="errors.length > 0"
                          v-model="confirm_pass"
                        />
                        <span class="text-danger text-sm">{{ errors[0] }}</span>
                      </validation-provider>
                    </div>
                  </div>
                  <div class="vx-row mb-6">
                    <div class="vx-col sm:w-1/3 w-full">
                      <span>{{ $t("new_pass") }}</span>
                    </div>
                    <div class="vx-col sm:w-2/3 w-full">
                      <validation-provider
                        :name="$t('new_pass')"
                        rules="required|min:6"
                        v-slot="{ errors }"
                      >
                        <vs-input
                          class="w-full"
                          type="password"
                          :danger="errors.length > 0"
                          v-model="new_pass"
                        />
                        <span class="text-danger text-sm">{{ errors[0] }}</span>
                      </validation-provider>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-wrap">
                <vs-button
                  class="mt-4 shadow-lg"
                  color="#bfbfbf"
                  type="filled"
                  @click.native="backToMain"
                >
                  {{ $t("cancel") }}
                </vs-button>
                &nbsp;
                <vs-button
                  class="mt-4 shadow-lg ml-4"
                  color="success"
                  type="filled"
                  @click="updatePass(validate)"
                >
                  {{ $t("update") }}
                </vs-button>
              </div>
            </validation-observer>
          </vs-tab>
        </vs-tabs>
      </div>
    </div>
  </vx-card>
</template>

<script>
export default {
  name: "edit-user",
  props: {
    backToMain: {
      type: Function,
    },
    editData: {
      type: Object,
    },
  },
  data: () => ({
    editRole: null,
    roleArr: [],
    new_pass: null,
    confirm_pass: null,
    password: null,
  }),
  created() {
    this.editRole = this.editData.role;
    this.roleArr = [
      { text: this.$t("admin"), value: "1" },
      { text: this.$t("user"), value: "2" },
    ];
  },
  methods: {
    async updateRole(validate) {
      let result = await validate();
      if (result) {
        let body = { user_id: this.editData.u_id, role: this.editRole };
        this.$store.dispatch("openLoading");
        let result = await this.postMethod("/edit_user_role", body);
        this.$store.dispatch("closeLoading");
        if (!result.code) {
          this.$swal({
            title: this.$t("role_update_complete"),
            icon: "success",
            timer: 1000,
          });
          setTimeout(this.backToMain, 1000);
        }
      }
    },
    async updatePass(validate) {
      let result = await validate();
      if (result) {
        let body = {
          user_id: this.editData.u_id,
          new_pass: this.new_pass,
          password: this.password,
        };
        this.$store.dispatch("openLoading");
        let result = await this.postMethod("/edit_user_password", body);
        this.$store.dispatch("closeLoading");
        if (!result.code) {
          this.$swal({
            title: this.$t("password_update_complete"),
            icon: "success",
            timer: 1000,
          });
          setTimeout(this.backToMain, 1000);
        }
      }
    },
  },
};
</script>