<template>
  <vx-card :title="$t('add_new_user')">
    <validation-observer v-slot="{ validate }">
      <div class="vx-row">
        <div class="vx-col sm:w-1/2 w-full">
          <div class="vx-row mb-6">
            <div class="vx-col sm:w-1/3 w-full">
              <span>{{ $t("username") }}</span>
            </div>
            <div class="vx-col sm:w-2/3 w-full">
              <validation-provider
                :name="$t('username')"
                rules="required"
                v-slot="{ errors }"
              >
                <vs-input
                  class="w-full"
                  :danger="errors.length > 0"
                  :warning="dupUser"
                  :warning-text="$t('dup_user')"
                  v-model="user_id"
                  @change="checkUsername(user_id)"
                />
                <span class="text-danger text-sm">{{ errors[0] }}</span>
              </validation-provider>
            </div>
          </div>
          <div class="vx-row mb-6">
            <div class="vx-col sm:w-1/3 w-full">
              <span>{{ $t("password") }}</span>
            </div>
            <div class="vx-col sm:w-2/3 w-full">
              <validation-provider
                :name="$t('password')"
                rules="required|min:6"
                v-slot="{ errors }"
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
              <span>{{ $t("role") }}</span>
            </div>
            <div class="vx-col sm:w-2/3 w-full">
              <validation-provider
                :name="$t('role')"
                rules="required"
                v-slot="{ errors }"
              >
                <vs-select
                  v-model="role"
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
              class="mt-4 shadow-lg"
              color="success"
              type="filled"
              @click="createUser(validate)"
              >{{ $t("create_user") }}</vs-button
            >
          </div>
        </div>
      </div>
    </validation-observer>
  </vx-card>
</template>

<script>
export default {
  name: "add-new-user",
  props: {
    backToMain: {
      type: Function,
    },
  },
  data: () => ({
    user_id: null,
    password: null,
    role: null,
    roleArr: [],
    dupUser: false,
  }),
  created() {
    this.roleArr = [
      { text: this.$t("admin"), value: "1" },
      { text: this.$t("user"), value: "2" },
    ];
  },
  methods: {
    async createUser(validate) {
      let check = await validate();
      if (check && !this.dupUser) {
        let body = {
          user_id: this.user_id,
          password: this.password,
          role: this.role,
        };
        this.$store.dispatch("openLoading");
        let r1 = await this.postMethod("/create_new_user", body);
        this.$store.dispatch("closeLoading");
        if (!r1.code) {
          this.$vs.notify({
            title: this.$t("add_user_complete"),
            color: "success",
            position: "top-right",
          });
          setTimeout(this.backToMain, 1000);
        }
      }
    },
    async checkUsername(value) {
      this.dupUser = false;
      if (value) {
        this.$store.dispatch("openLoading");
        let result = await this.getMethod("/check_username", { user: value });
        this.$store.dispatch("closeLoading");
        if (result.code) {
          if (result.message == "already_used") {
            this.dupUser = true;
          }
        }
      }
    },
  },
};
</script>