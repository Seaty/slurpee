<!-- =========================================================================================
    File Name: Login.vue
    Description: Login Page
    ----------------------------------------------------------------------------------------
    Item Name: Vuesax Admin - VueJS Dashboard Admin Template
      Author: Pixinvent
    Author URL: http://www.themeforest.net/user/pixinvent
========================================================================================== -->


<template>
  <div
    class="h-screen flex w-full bg-img vx-row no-gutter items-center justify-center"
    id="page-login"
  >
    <div class="vx-col sm:w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/3 sm:m-0 m-4">
      <vx-card>
        <div slot="no-body" class="full-page-bg-color">
          <div class="vx-row no-gutter justify-center items-center">
            <div class="vx-col sm:w-full md:w-full d-theme-dark-bg">
              <div class="p-8">
                <div class="vx-card__title mb-8">
                  <h4 class="mb-4">{{ $t("login_card_title") }}</h4>
                  <p>Welcome back, please login to your account.</p>
                </div>
                <vs-input
                  name="email"
                  icon="icon icon-user"
                  icon-pack="feather"
                  :label-placeholder="$t('username')"
                  v-model="username"
                  class="w-full no-icon-border"
                />

                <vs-input
                  type="password"
                  name="password"
                  icon="icon icon-lock"
                  icon-pack="feather"
                  :label-placeholder="$t('password')"
                  v-model="password"
                  class="w-full mt-6 no-icon-border"
                />

                <div class="flex flex-wrap justify-between my-5">
                  <i></i>
                  <vs-button
                    class="float-right"
                    :disabled="loginStatus"
                    @click="checkLogin"
                  >
                    Login
                  </vs-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </vx-card>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    async checkLogin() {
      let body = { user_id: this.username, password: this.password };
      this.$store.dispatch("openLoading");
      let result = await this.postMethod("/get_login", body);
      if (result.code) {
        this.$swal({
          title: this.$t("login_failed"),
          icon: "error",
          text: this.$t(result.message),
          timer: 1000,
        });
        this.$store.dispatch("closeLoading");
      } else {
        localStorage.setItem("userRole",result.role)
        this.$store.dispatch("updateUserRole", result.role);
        this.$store.dispatch("updateUserName", this.username);
        this.$store.dispatch("closeLoading");
        this.$router.push(this.$router.currentRoute.query.to || "/");
      }
    },
  },
  computed: {
    loginStatus() {
      return !this.username || !this.password;
    },
  },
};
</script>

<style lang="scss">
#page-login {
  .social-login {
    .bg-facebook {
      background-color: #1551b1;
    }
    .bg-twitter {
      background-color: #00aaff;
    }
    .bg-google {
      background-color: #4285f4;
    }
    .bg-github {
      background-color: #333;
    }
  }
}
</style>
