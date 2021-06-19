import HttpRequest from './http_service'
import store from '../store/store'
import axios from 'axios'


class UserProvider extends HttpRequest {

    constructor() {
        // api api
        // super('http://203.151.70.135:3007')
        super('http://localhost:3007')
    }

    async getMethod(fn_name, query) {
        const returnData = await this.get(fn_name, { ...query, username: store.getters.getUserName })
        if (returnData.status == 200) {
            return returnData.data
        } else {
            return returnData
        }
    }

    async postMethod(fn_name, body, more_query = {}) {
        const returnData = await this.create(fn_name, body, {
            params: {
                ...more_query, username: store.getters.getUserName
            }
        })
        if (returnData.status == 200) {
            return returnData.data
        } else {
            return returnData
        }
    }

    async postMethodWithFile(fn_name, body, more_query = {}) {
        try {
            const reTurnData = await this.create(fn_name, body, {
                headers: { "Content-Type": "multipart/form-data" }, params: {
                    ...more_query
                }
            })
            if (reTurnData.status == 200) {
                return reTurnData.data
            } else {
                return reTurnData
            }
        } catch (error) {
            console.log({ error });
            if (error.response) {
                return error.response
            }
            return { code: true, message: 'connection_problem' }
        }

    }

    async deleteMethod(fn_name, more_query = {}, body = {}) {
        const returnData = await this.delete(fn_name, {
            params: {
                ...more_query, username: store.getters.getUserName
            }
        }, body)
        if (returnData.status == 200) {
            return returnData.data
        } else {
            return returnData
        }
    }

    async getLatLngFromName(value) {
        let result = await axios({
            method: 'get',
            url: 'https://www.deemap.com/DeeMap2WS_GC_dtc-ws/jsonSearch.jsp',
            params: {
                start: 0,
                limit: 10,
                query: value,
                mode: 0,
                dsrc: 'DeeMap2'
            }
        })
        if (result.status == 200) {
            return { code: false, data: result.data.rows }
        } else {
            return { code: true, message: result.message }
        }
    }
}

export default UserProvider