const pgcon = require("./newnode_pgconnection");
const config = require("./config");
const dbname = "slp";
const moment = require("moment");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const bcrypt = require("bcrypt");
const secret_key =
  "p&p}F)!lJH5E-^yu]rCY$zT2lB0F451,0p@/R>a|Xf0SGGkAd>x_J7}-%L+j.Iu";
// const startPath = `/var/www/html/slurpee/` // Real path
const startPath = `./temp/`; // Test path

exports.check_new_equipment = async (req, res, next) => {
  try {
    let eq_id = req.body["eq_id"];
    let sql = `SELECT eq_id FROM eqms WHERE eq_id = '${eq_id}' `;
    let r1 = await pgcon.get(dbname, sql, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      if (r1.data.length > 0) {
        res.send({ code: true, message: "eq_id_duplicated" });
      } else {
        next();
      }
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.upsert_equipment = async (req, res) => {
  try {
    let { eq_id, lat, lon, remark, place_detail } = req.body;
    let sql = `INSERT INTO eqms(eq_id,lat,lon,remark,place_detail,last_config) VALUES($1,$2,$3,$4,$5,NOW()) 
        ON CONFLICT (eq_id) DO  UPDATE SET lat = EXCLUDED.lat ,lon = EXCLUDED.lon ,remark = EXCLUDED.remark ,place_detail = EXCLUDED.place_detail `;
    let data = [eq_id, lat, lon, remark, place_detail];
    let r1 = await pgcon.excutewithparams(
      sql,
      data,
      dbname,
      config.connectionString()
    );
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({ code: false });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.get_equipment_data = async (req, res) => {
  try {
    let sql1 = `SELECT eq_id,lat,lon,remark,place_detail,last_config,last_update FROM eqms ORDER BY last_update`;
    let r1 = await pgcon.get(dbname, sql1, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({ code: false, data: r1.data });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.delete_equipment = async (req, res) => {
  try {
    let eq_id = req.body["eq_id"];
    let sql = `DELETE FROM eqms WHERE eq_id = '${eq_id}'`;
    let r1 = await pgcon.execute(dbname, sql, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({ code: false });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.get_group_master = async (req, res) => {
  try {
    let sql = `SELECT gpms.g_id , g_name , last_config , time_create , ARRAY_AGG(gpeq.eq_id) as eq_list  FROM gpms LEFT JOIN gpeq ON gpms.g_id = gpeq.g_id GROUP BY gpms.g_id`;
    let r1 = await pgcon.get(dbname, sql, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({ code: false, data: r1.data });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.add_new_group = async (req, res) => {
  try {
    let { g_name, eq_list } = req.body;
    let sql1 = `SELECT indexs FROM idms WHERE type = 'group'`;
    let r1 = await pgcon.get(dbname, sql1, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      let last_index = r1.data[0].indexs + 1;
      let new_id = "g-" + ("00000" + last_index).slice(-5);
      let sql2 = `INSERT INTO gpms(g_id,g_name,last_config,time_create) VALUES ($1,$2,NOW(),NOW())`;
      let data2 = [new_id, g_name];
      let sql3 = `INSERT INTO gpeq(g_id,eq_id,time_config) VALUES ($1,$2,NOW())`;
      let data3 = eq_list.map((x) => [new_id, x]);
      let insertArr = eq_list.map(() => sql3);
      insertArr.unshift(sql2);
      data3.unshift(data2);
      let r3 = await pgcon.inserttransactionwithData(
        insertArr,
        data3,
        dbname,
        config.connectionString()
      );
      if (r3.code) {
        res.send({ code: true, message: r3.message });
      } else {
        let update_sql = `UPDATE idms SET indexs = indexs + 1 WHERE type = 'group' `;
        await pgcon.execute(dbname, update_sql, config.connectionString());
        res.send({ code: false });
      }
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.edit_group_data = async (req, res) => {
  try {
    let { g_name, eq_list, g_id } = req.body;
    let sql1 = `SELECT g_id FROM gpms WHERE g_id = '${g_id}'`;
    let r1 = await pgcon.get(dbname, sql1, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      let sqlArr = [];
      let dataArr = [];
      //update gpms
      sqlArr.push(
        `UPDATE gpms SET g_name = $1 , last_config = NOW() WHERE g_id = $2`
      );
      dataArr.push([g_name, g_id]);
      //delete gpeq
      sqlArr.push(`DELETE FROM gpeq WHERE g_id = $1`);
      dataArr.push([g_id]);
      //insert gpeq
      let tempSql = eq_list.map(
        () => `INSERT INTO gpeq(g_id,eq_id,time_config) VALUES ($1,$2,NOW())`
      );
      let tempData = eq_list.map((x) => [g_id, x]);
      sqlArr = sqlArr.concat(tempSql);
      dataArr = dataArr.concat(tempData);
      let r2 = await pgcon.inserttransactionwithData(
        sqlArr,
        dataArr,
        dbname,
        config.connectionString()
      );
      if (r2.code) {
        res.send({ code: true, message: r2.message });
      } else {
        res.send({ code: false });
      }
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.delete_group_data = async (req, res) => {
  try {
    let { g_id } = req.body;
    let sqlArr = [];
    let dataArr = [];
    sqlArr.push(`DELETE FROM gpms WHERE g_id = $1`);
    dataArr.push([g_id]);
    sqlArr.push(`DELETE FROM gpeq WHERE g_id = $1`);
    dataArr.push([g_id]);
    let r1 = await pgcon.inserttransactionwithData(
      sqlArr,
      dataArr,
      dbname,
      config.connectionString()
    );
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({ code: false });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.get_group_with_video = async (req, res) => {
  try {
    // let sql = `SELECT gpms.g_id , g_name , last_config , time_create , ARRAY_AGG(vdoms.v_id) as v_list  FROM gpms LEFT JOIN vdoms ON gpms.g_id = vdoms.g_id GROUP BY gpms.g_id`
    let sql = `SELECT  gpms.g_id, gpms.g_name FROM gpms `;
    let r1 = await pgcon.get(dbname, sql, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({ code: false, data: r1.data });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

var videoDestination = async (req, file, callback) => {
  try {
    let { g_id } = req.query;
    let uploadPath = startPath + g_id;
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    callback(null, uploadPath);
  } catch (error) {
    console.log(error);
    callback(error.message, null);
  }
};

var videoFilter = async (req, file, callback) => {
  try {
    let { g_id } = req.query;
    let uploadPath = startPath + g_id + `/${file.originalname}`;
    if (fs.existsSync(uploadPath)) {
      //file exists
      callback(new Error("name_duplicated"), null);
    } else {
      callback(null, true);
    }
  } catch (error) {
    callback(error.message, null);
  }
};

var slpVideoDir = multer.diskStorage({
  destination: videoDestination,
  filename: async (req, file, cb) => {
    try {
      cb(null, file.originalname);
    } catch (error) {
      cb(error, null);
    }
  },
});

var slpUpload = multer({
  storage: slpVideoDir,
  fileFilter: videoFilter,
}).single("vfile");

var slpUploadmulti = multer({
  storage: slpVideoDir,
  fileFilter: videoFilter,
}).array("vfile");

exports.uploadHandler = (req, res, next) => {
  slpUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.send({ code: true, message: err.message });
    } else if (err) {
      res.send({ code: true, message: err.message });
    } else {
      next();
    }
  });
};

exports.upload_video_multi = async (req, res, next) => {
  slpUploadmulti(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.send({ code: true, message: err.message });
    } else if (err) {
      res.send({ code: true, message: err.message });
    } else {
      debugger;
      next();
    }
  });
};

exports.upload_result = async (req, res) => {
  try {
    let files = req.files.file;
    let g_id = req.query["g_id"];

    let uploadPath = startPath; //+ g_id;
    // if (!fs.existsSync(uploadPath)) {
    //   fs.mkdirSync(uploadPath);
    // }
    debugger;
    if (Array.isArray(files)) {
      for (let file of files) {
        let sql1 = `SELECT indexs FROM idms WHERE type = 'video'`;
        let r1 = await pgcon.get(dbname, sql1, config.connectionString());
        if (r1.code) {
          return res.send({ code: true, message: r1.message });
        }
        let last_index = r1.data[0].indexs + 1;
        let new_id = "v-" + ("00000" + last_index).slice(-5);
        let sqlArr = [];
        let dataArr = [];
        sqlArr.push(
          `INSERT INTO vms(v_id,filename,upload_time) VALUES ($1,$2,NOW())`
        );
        dataArr.push([new_id, file.name]);
        sqlArr.push(`UPDATE idms SET indexs = indexs + 1 WHERE type = 'video'`);
        dataArr.push([]);
        let r2 = await pgcon.inserttransactionwithData(
          sqlArr,
          dataArr,
          dbname,
          config.connectionString()
        );
        if (r2.code) {
          return res.send({ code: true, message: r2.message });
        }
        let uploadErr = await file.mv(uploadPath + `/${new_id}.mp4`); //file.name
        if (uploadErr) {
          console.error(uploadErr);
          return res.status(500).send(uploadErr);
        }
      }
      res.send({ code: false });
    } else {
      let sql1 = `SELECT indexs FROM idms WHERE type = 'video'`;
      let r1 = await pgcon.get(dbname, sql1, config.connectionString());
      if (r1.code) {
        return res.send({ code: true, message: r1.message });
      }
      let last_index = r1.data[0].indexs + 1;
      let new_id = "v-" + ("00000" + last_index).slice(-5);
      let sqlArr = [];
      let dataArr = [];
      sqlArr.push(
        `INSERT INTO vms(v_id,filename,upload_time) VALUES ($1,$2,NOW())`
      );
      dataArr.push([new_id, files.name]);
      sqlArr.push(`UPDATE idms SET indexs = indexs + 1 WHERE type = 'video'`);
      dataArr.push([]);
      let r2 = await pgcon.inserttransactionwithData(
        sqlArr,
        dataArr,
        dbname,
        config.connectionString()
      );
      if (r2.code) {
        return res.send({ code: true, message: r2.message });
      }
      files.mv(uploadPath + `/${new_id}.mp4`, function (err) {
        //files.name
        if (err) {
          console.error(err);
          return res.status(500).send(err);
        }
        res.send({ code: false });
      });
    }
  } catch (error) {
    console.error(error);
    res.send({ code: true, message: error.message });
  }
};

exports.matching_new_upload = async (req, res) => {
  try {
    let { g_id } = req.query;
    let { start_date, end_date } = JSON.parse(req.body["v_detail"]);
    let file = req.file;
    let sql1 = `SELECT indexs FROM idms WHERE type = 'video'`;
    let r1 = await pgcon.get(dbname, sql1, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      let last_index = r1.data[0].indexs + 1;
      let new_id = "v-" + ("00000" + last_index).slice(-5);
      let sqlArr = [];
      let dataArr = [];
      sqlArr.push(
        `INSERT INTO vms(v_id,filename,upload_time) VALUES ($1,$2,NOW())`
      );
      dataArr.push([new_id, file.filename, g_id, start_date, end_date, false]);
      sqlArr.push(`UPDATE idms SET indexs = indexs + 1 WHERE type = 'video'`);
      dataArr.push([]);
      let r2 = await pgcon.inserttransactionwithData(
        sqlArr,
        dataArr,
        dbname,
        config.connectionString()
      );
      if (r2.code) {
        res.send({ code: true, message: r2.message });
      } else {
        res.send({ code: false });
      }
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.get_video_by_gid = async (req, res) => {
  try {
    let { g_id } = req.query;
    let sql1 = `SELECT v_id,file_name,seq,start_date,end_date,status,upload_time,g_id FROM vdoms WHERE g_id = '${g_id}' `;
    let r1 = await pgcon.get(dbname, sql1, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({ code: false, data: r1.data });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.load_video_by_var = async (req, res) => {
  try {
    let { g_id, file_name } = req.params;
    let path = startPath + g_id + `/${file_name}`;
    fs.stat(path, (err, stat) => {
      // Handle file not found
      if (err !== null && err.code === "ENOENT") {
        res.sendStatus(404);
      }

      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");

        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunksize = end - start + 1;
        const file = fs.createReadStream(path, { start, end });
        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4",
        };

        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        };

        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
      }
    });
  } catch (error) {
    res.sendStatus(404);
  }
};

exports.load_video_by_var2 = async (req, res) => {
  try {
    let { file_name } = req.params;
    let path = startPath + `${file_name}.mp4`;
    fs.stat(path, (err, stat) => {
      // Handle file not found
      if (err !== null && err.code === "ENOENT") {
        res.sendStatus(404);
      }

      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");

        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunksize = end - start + 1;
        const file = fs.createReadStream(path, { start, end });
        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4",
        };

        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        };

        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
      }
    });
  } catch (error) {
    res.sendStatus(404);
  }
};

exports.update_video_status = async (req, res) => {
  try {
    let { data, g_id } = req.body;
    let sqlArr = data.map(
      () =>
        `UPDATE vdoms SET seq = $1 , status = $2 WHERE v_id = $3 AND g_id = $4 `
    );
    let dataArr = data.map((x) => [x.seq, x.status, x.v_id, g_id]);
    let r1 = await pgcon.inserttransactionwithData(
      sqlArr,
      dataArr,
      dbname,
      config.connectionString()
    );
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({ code: false });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.get_playing_video = async (req, res) => {
  try {
    let { eq_id } = req.query;
    let sql = `SELECT CONCAT('${startPath}',vdoms.g_id,'/',vdoms.file_name) as file_path ,
        start_date,end_date FROM vdoms LEFT JOIN gpeq ON vdoms.g_id = gpeq.g_id WHERE CURRENT_DATE >= start_date AND CURRENT_DATE <= end_date 
         AND gpeq.eq_id = '${eq_id}' AND vdoms.status = 't' ORDER BY vdoms.seq`;
    let r1 = await pgcon.get(dbname, sql, config.connectionString());
    if (r1.code) {
      console.log(r1.message);
      res.status(500).json({ code: true, message: r1.message });
    } else {
      let sql2 = `UPDATE vdoms SET last_update = NOW() WHERE eq_id = '${eq_id}';INSERT INTO hseq(eq_id,time_inserver) VALUES (${eq_id},NOW());`;
      await pgcon.execute(dbname, sql2, config.connectionString());
      res.send({ code: false, data: r1.data });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ code: true, message: error.message });
  }
};

exports.delete_video = async (req, res) => {
  try {
    let { v_id, file_name, g_id, seq } = req.body["v_item"];
    let sql1 = `SELECT v_id,seq FROM vdoms WHERE g_id = '${g_id}'`;
    let r1 = await pgcon.get(dbname, sql1, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      let nonDelVideo = r1.data.filter((x) => x.v_id != v_id);
      let sqlArr = [];
      let dataArr = [];
      sqlArr.push(`DELETE FROM vdoms WHERE v_id = $1`);
      dataArr.push([v_id]);
      if (seq) {
        let tempSql = nonDelVideo.map(
          () => `UPDATE vdoms SET seq = $1 WHERE v_id = $2 AND g_id = $3`
        );
        let tempData = nonDelVideo.map((x) => {
          if (x.seq > seq) {
            x.seq--;
          }
          return [x.seq, x.v_id, g_id];
        });
        sqlArr = sqlArr.concat(tempSql);
        dataArr = dataArr.concat(tempData);
      }
      let r2 = await pgcon.inserttransactionwithData(
        sqlArr,
        dataArr,
        dbname,
        config.connectionString()
      );
      if (r2.code) {
        let temp = res.send({ code: true, message: r1.message });
      } else {
        fs.unlinkSync(startPath + g_id + "/" + file_name);
        res.send({ code: false });
      }
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.create_new_user = async (req, res) => {
  try {
    let { user_id, password, role } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    let sql1 = `INSERT INTO unms(u_id,pwd,time_create,role) VALUES ($1,$2,NOW(),$3)`;
    let data1 = [user_id, hash, role];
    let r1 = await pgcon.excutewithparams(
      sql1,
      data1,
      dbname,
      config.connectionString()
    );
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({ code: false });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.check_username = async (req, res) => {
  try {
    let user_id = req.query["user"];
    let sql1 = `SELECT COUNT(u_id) FROM unms WHERE u_id = '${user_id}'`;
    let r1 = await pgcon.get(dbname, sql1, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      let count = parseInt(r1.data[0].count);
      if (count > 0) {
        res.send({ code: true, message: "already_used" });
      } else {
        res.send({ code: false });
      }
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.get_login = async (req, res) => {
  try {
    let { user_id, password } = req.body;
    let sql1 = `SELECT pwd , role FROM unms WHERE u_id = '${user_id}'`;
    let r1 = await pgcon.get(dbname, sql1, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      let hash = r1.data[0].pwd;
      const isSame = await bcrypt.compare(password, hash);
      if (isSame) {
        let sql2 = `UPDATE unms SET last_login = NOW() WHERE u_id = '${user_id}'`;
        await pgcon.execute(dbname, sql2, config.connectionString());
        res.send({ code: false, role: r1.data[0].role });
      } else {
        res.send({ code: true, message: "auth_failed" });
      }
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.get_username_data = async (req, res) => {
  try {
    let sql1 = `SELECT u_id,time_create,role FROM unms ORDER BY u_id`;
    let r1 = await pgcon.get(dbname, sql1, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({ code: false, data: r1.data });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.delete_user_data = async (req, res) => {
  try {
    let { user_id } = req.body;
    let sql1 = `DELETE FROM unms WHERE u_id = '${user_id}'`;
    let r1 = await pgcon.execute(dbname, sql1, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({ code: false });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.edit_user_role = async (req, res) => {
  try {
    let { user_id, role } = req.body;
    let sql1 = `UPDATE unms SET role = '${role}' WHERE u_id = '${user_id}' `;
    let r1 = await pgcon.execute(dbname, sql1, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({ code: false });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.edit_user_password = async (req, res) => {
  try {
    let { user_id, new_pass, password } = req.body;
    let sql1 = `SELECT pwd , role FROM unms WHERE u_id = '${user_id}'`;
    let r1 = await pgcon.get(dbname, sql1, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      let hash = r1.data[0].pwd;
      const isSame = await bcrypt.compare(password, hash);
      if (isSame) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(new_pass, salt);
        let sql2 = `UPDATE unms SET pwd =  '${hash}' WHERE u_id = '${user_id}'`;
        let r2 = await pgcon.execute(dbname, sql2, config.connectionString());
        if (r2.code) {
          res.send({ code: true, message: r2.message });
        } else {
          res.send({ code: false });
        }
      } else {
        res.send({ code: true, message: "pass_not_true" });
      }
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.get_ads_data = async (req, res) => {
  try {
    let { g_id, start_date, end_date } = req.query;
    let sql1 = `SELECT time_start as time_from  , time_end as time_to , vdo_arr FROM gvdo WHERE g_id = '${g_id}' AND date_start = '${start_date}' AND date_end = '${end_date}'`;
    let r1 = await pgcon.get(dbname, sql1, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({
        code: false,
        data: r1.data.map((x) => {
          x.time_from = x.time_from.slice(0, 5);
          x.time_to = x.time_to.slice(0, 5);
          return x;
        }),
      });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.get_all_vms = async (req, res) => {
  try {
    let sql = `SELECT v_id , filename FROM vms`;
    let r1 = await pgcon.get(dbname, sql, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({ code: false, data: r1.data });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.save_ads_setting = async (req, res) => {
  try {
    let { g_id, date_start, date_end, times, videos } = req.body;
    let sqlArr = [];
    let dataArr = [];
    sqlArr.push(
      `DELETE FROM gvdo WHERE g_id = $1 AND date_start = $2 AND date_end = $3`
    );
    dataArr.push([g_id, date_start, date_end]);
    for (let time of times) {
      sqlArr.push(
        `INSERT INTO gvdo(g_id,date_start,date_end,time_start,time_end,vdo_arr,last_update) VALUES ($1,$2,$3,$4,$5,$6,NOW())`
      );
      dataArr.push([
        g_id,
        date_start,
        date_end,
        time.time_from,
        time.time_to,
        videos[`${time.time_from}-${time.time_to}`],
      ]);
    }
    let r1 = await pgcon.inserttransactionwithData(
      sqlArr,
      dataArr,
      dbname,
      config.connectionString()
    );
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({ code: false });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.get_date_gvdo = async (req, res) => {
  try {
    let g_id = req.query["g_id"];
    let sql = `SELECT date_start,date_end,time_start,time_end  FROM gvdo WHERE g_id = '${g_id}'`;
    let r1 = await pgcon.get(dbname, sql, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      let result = [];
      r1.data.forEach((data) => {
        data.date_start = moment(data.date_start).format("YYYY-MM-DD");
        data.date_end = moment(data.date_end).format("YYYY-MM-DD");
        let index = result.findIndex(
          (x) => x.date_start == data.date_start && x.date_end == data.date_end
        );
        if (index > -1) {
          result[index].time.push({
            time_start: data.time_start,
            time_end: data.time_end,
          });
        } else {
          result.push({
            date_start: data.date_start,
            date_end: data.date_end,
            time: [{ time_start: data.time_start, time_end: data.time_end }],
          });
        }
      });

      res.send({ code: false, data: result });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.delete_ads_by_time = async (req, res) => {
  try {
    let { g_id, date_start, date_end } = req.body;
    let sql1 = `DELETE FROM gvdo WHERE date_start = '${date_start}' AND date_end = '${date_end}' AND g_id = '${g_id}' `;
    let r1 = await pgcon.execute(dbname, sql1, config.connectionString());
    if (r1.code) {
      res.send({ code: true, message: r1.message });
    } else {
      res.send({ code: false });
    }
  } catch (error) {
    res.send({ code: true, message: error.message });
  }
};

exports.get_vdo_at_time = async (req, res) => {
  try {
    let { g_id, date_start, date_end, start_time, end_time } = req.query;
    let sql = `SELECT vdo_arr FROM gvdo  WHERE date_start = '${date_start}' AND date_end = '${date_end}' AND g_id = '${g_id}' AND time_start AND time_end`;
  } catch (error) {}
};
