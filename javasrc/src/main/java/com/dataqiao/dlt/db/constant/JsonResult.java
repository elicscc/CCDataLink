package com.dataqiao.dlt.db.constant;


import com.dataqiao.dlt.db.util.JsonUtil;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * @author CC
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
public class JsonResult<T> {


    private Integer code;

    private String message;

    private T data;

    public static <T> String success() {
        return JsonUtil.toJsonString(new JsonResult<>().setCode(20000));
    }

    public static <T> String success(T data) {
        return JsonUtil.toJsonString(new JsonResult<>().setCode(20000).setData(data));
    }

    public static <T> String error(String message) {
        return JsonUtil.toJsonString(new JsonResult<>().setCode(50000).setMessage(message));
    }

}
