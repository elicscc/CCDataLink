package com.dataqiao.dlt;

import com.dataqiao.dlt.db.util.JsonUtil;
import com.dataqiao.dlt.db.util.StringUtils;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
public class TestParseApi {
    static int uid = 2111050;        //替换为你的用户名（int格式）
    static String pwd = "oM3Vuc";    //替换为你的密码（String格式）
    static String url = "http://www.resumesdk.com/api/match";
    /**
     * 请求接口格式：（更详细可参考官网：http://www.resumesdk.com/docs/rs-parser.html#reqType）
     * - uid: 必填，用户id；
     * - pwd: 必填，用户密码；
     * - file_name: 必填，简历文件名（请确保后缀正确）；
     * - file_cont: 必填，经based64编码的简历文件内容；
     * - need_avatar: 可选，是否需要解析头像，0为不需要，1为需要，默认为0；
     * - ocr_type: 可选，ocr（图片解析所用到的文字识别）类型，0为百度ocr，1为腾讯ocr（需要注册并配置百度或者腾讯的OCR服务）。腾讯ocr的效果更佳，默认为0。
     * - need_social_exp: 可选，是否需要解析实践经历，0为不需要，1为需要，默认为0；
     */
    public static String testResumeParser(String fname) throws Exception {
        // 设置头字段
        HttpPost httpPost = new HttpPost(url);
        httpPost.addHeader("content-type", "application/json");

        // 读取简历内容
        byte[] bytes = Files.readAllBytes(Paths.get(fname));
        String data = new String(Base64.getEncoder().encode(bytes), StandardCharsets.UTF_8.name());

        // 设置请求接口信息
        Map<String, Object> json = new HashMap<>();
        json.put("uid", uid);            // 用户id
        json.put("pwd", pwd);            // 用户密码
        json.put("file_name", fname);    // 文件名
        json.put("file_cont", data);    // 经base64编码过的文件内容
        json.put("need_avatar", 0);
        json.put("ocr_type", 1);
        StringEntity params = new StringEntity(JsonUtil.toJsonString(json), StandardCharsets.UTF_8.name());
        httpPost.setEntity(params);

        // 发送请求
        HttpClient httpclient = new DefaultHttpClient();
        HttpResponse response = httpclient.execute(httpPost);

        // 处理返回结果
        String resCont = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8.name());
        log.info("response string is {}", resCont);

        Map res = JsonUtil.parseObject(resCont, Map.class);
        Map status = (Map) res.get("status");
        if (status.get("code").equals(200)) {
            log.info("request failed: code=<" + status.get("code") + ">, message=<" + status.get("message") + ">");
        } else {
            Map acc = (Map) res.get("account");
            log.info("usage_remaining:" + acc.get("usage_remaining"));

            Map result = (Map) res.get("result");
            log.info("result:\n" + result.toString());
            log.info("request succeeded");
        }
        return JsonUtil.toJsonString(status);
    }

    public static String testResumeMatch(String fname, String title, String salary,String work_year, String degree,String city,   String content,String fileContent) throws Exception {
        // 设置头字段
        HttpPost httpPost = new HttpPost(url);
        httpPost.addHeader("content-type", "application/json");
        // 读取简历内容
        byte[] bytes;
        if (StringUtils.isNotBlank(fileContent)){
            bytes = fileContent.getBytes(StandardCharsets.UTF_8);
        }else {
            bytes = Files.readAllBytes(Paths.get(fname));
        }

        String data = new String(Base64.getEncoder().encode(bytes), StandardCharsets.UTF_8.name());

        // 设置请求接口信息
        Map<String, Object> json = new HashMap<String, Object>();
        json.put("uid", uid);            // 用户id
        json.put("pwd", pwd);            // 用户密码
        json.put("file_name", fname);    // 文件名
        json.put("file_cont", data);    // 经base64编码过的文件内容
        json.put("file_type", 0);
//        json.put("jd_obj", "{\"title\": \"java\", \"city\": \"上海\", \"salary\": \"8000-15000元/月\", \"work_year\": \"3-5年\", \"degree\": \"本科\", \"content\": \"java开发\"}");
        json.put("need_parse_result", 1);

        Map<String, Object> jdObj = new HashMap<>();
        jdObj.put("title", title);
        jdObj.put("city", city);
        jdObj.put("salary", salary);
        jdObj.put("work_year", work_year);
        jdObj.put("degree", degree);
        jdObj.put("content", content);

        json.put("jd_obj", jdObj);

        StringEntity params = new StringEntity(JsonUtil.toJsonString(json), StandardCharsets.UTF_8.name());
        log.info("request jd_obj is {}", jdObj);
        httpPost.setEntity(params);

        // 发送请求
        HttpClient httpclient = new DefaultHttpClient();
        HttpResponse response = httpclient.execute(httpPost);

        // 处理返回结果
        String resCont = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8.name());

        log.info(resCont);
        Map res = JsonUtil.parseObject(resCont, Map.class);
        log.info(res.toString());

        Map<String, Object> status = (Map<String, Object>) res.get("status");
        if (status.get("code").equals(200)) {
            log.info("request failed: code=<" + status.get("code") + ">, message=<" + status.get("message") + ">");
        } else {
            Map acc = (Map) res.get("account");
            log.info("usage_remaining:" + acc.get("usage_remaining"));

            Map parseResult = (Map) res.get("parse_result");
            log.info("result:\n" + parseResult.toString());
            Map matchResult = (Map) res.get("match_result");
            log.info("result:\n" + matchResult.toString());

            log.info("request succeeded");
        }
        return JsonUtil.toJsonString(res);
    }

    public static void main(String[] args) throws Exception {
        String fname = "C:\\Users\\Administrator\\Desktop\\高先生_34岁_智联简历_21952.pdf";    //替换为你的文件名

//        String url = "http://www.resumesdk.com/api/parse";
//        testResumeParser(url, fname, uid, pwd);

        testResumeMatch(fname,"java", "北京", "10000-20000", "8", "本科及以上", "java开发", "");

    }
}
