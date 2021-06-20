const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const service = require("./service_fn.js");
const moment = require("moment");
const app = express();
const port_service = 3007;
const fileUpload = require("express-fileupload");

app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "100mb",
  })
);

app.use(fileUpload());
app.use(logFunction);
app.post(
  "/add_new_equipment",
  service.check_new_equipment,
  service.upsert_equipment
);
app.post("/update_equipment", service.upsert_equipment);
app.get("/get_equipment_data", service.get_equipment_data);
app.post("/delete_equipment", service.delete_equipment);
app.get("/get_group_master", service.get_group_master);
app.post("/add_new_group", service.add_new_group);
app.post("/edit_group_data", service.edit_group_data);
app.post("/delete_group_data", service.delete_group_data);
app.get("/get_group_with_video", service.get_group_with_video);
app.post(
  "/upload_new_video",
  service.uploadHandler,
  service.matching_new_upload
);
app.get("/get_video_by_gid", service.get_video_by_gid);
app.get("/load_video_by_var/:g_id/:file_name", service.load_video_by_var);
app.get("/load_video_by_var2/:file_name", service.load_video_by_var2);
app.post("/update_video_status", service.update_video_status);
app.get("/get_playing_video", service.get_playing_video);
app.post("/delete_video", service.delete_video);
app.post("/create_new_user", service.create_new_user);
app.get("/check_username", service.check_username);
app.get("/get_username_data", service.get_username_data);
app.post("/delete_user_data", service.delete_user_data);
app.post("/edit_user_password", service.edit_user_password);
app.post("/edit_user_role", service.edit_user_role);
app.post("/get_login", service.get_login);
app.post(
  "/upload_video_multi",
  service.upload_video_multi,
  service.upload_result
);
app.post("/upload_video_multi2", service.upload_result);
app.get("/get_ads_data", service.get_ads_data);
app.get("/get_all_vms", service.get_all_vms);

app.listen(port_service, () => {
  console.log("Start server with port " + port_service);
});

function logFunction(req, res, next) {
  console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " :" + req.url);
  next();
}
