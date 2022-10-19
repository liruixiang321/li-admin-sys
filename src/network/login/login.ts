import { ElMessage } from "element-plus";
import { request } from "../network";
interface getBody {
  studentId: string;
}
interface postBody {
  studentId?: string;
  password?: string;
  qq?: string;
}
interface patchBody {
  Nickname?: string;
  Avatar?: string;
  Sex?: string;
  Description?: string;
  Background?: string;
}
export function getrequest(param: string) {
  return request.get(param);
}
export function postrequest(param: string, body: postBody) {
  return request.post(param, body);
}
export function patchrequest(param: string, body: patchBody) {
  return request.patch(param, body);
}
request.interceptors.request.use((config) => { //请求拦截器
  if (window.localStorage.getItem("token") != "null") {
    config!.headers!.Authorization = `Bearer ${window.localStorage.getItem(
      "token"
    )}`;
  }
  return config;
});
request.interceptors.response.use(        //响应拦截器
  (res) => {
    console.log(res); 
    if (res.status == 200) {
      if (res.data.code == 200) {
        if (res.data.token) {
          ElMessage.closeAll();
          ElMessage.success({
            message: `登录成功`,
            center: true,
          });
        }
        return res;
      } else if (res.data.code == 1005) {//未登录
        ElMessage.closeAll();
        window.localStorage.clear() //将storage清空
        ElMessage.error({
          message: res.data.message,
          center: true,
        });
        return;
      } else if (res.data.code == 1004) {
        ElMessage.closeAll();
        ElMessage({
          message: res.data.message,
          center: true,
        });
        return;
      } else if (res.data.code == 1001) {
        ElMessage.closeAll();
        ElMessage({
          message: res.data.message,
          center: true,
        });
        return;
      }
      return res
    } else {
      ElMessage.closeAll();
      ElMessage.error({
        message: res.data.message,
        center: true,
      });
     
    }
  },
  (err: any) => {
    ElMessage.closeAll();
    ElMessage.error({
      message: "请检查网络设置",
      center: true,
    });
    return;
  }
);
