import Vue from 'vue'
import { AclInstaller, AclCreate, AclRule } from 'vue-acl'
import router from '../router'

Vue.use(AclInstaller)

export default new AclCreate({
    initial: 'public',
    notfound: {
        path: '/pages/error-404',
        forwardQueryParams: true,
    },
    router,
    acceptLocalRules: true,
    globalRules: {
        isAdmin: new AclRule('admin').generate(),
        isPublic: new AclRule('public').or('admin').generate(),
    },
    middleware: async acl => {
        acl.change("admin");
    }

})