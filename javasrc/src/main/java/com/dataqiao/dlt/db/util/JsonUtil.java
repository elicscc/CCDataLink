package com.dataqiao.dlt.db.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.SerializationFeature;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

/**
 * 自定义的json,用于替换fast json中的json对象,使用object mapper封装
 *
 * @author cc
 */
@Slf4j
public class JsonUtil {
    public static final ObjectMapper MAPPER;

    public static ObjectMapper MAPPER_UNDER_LINE;


    static {
        MAPPER = new ObjectMapper();
        MAPPER.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        MAPPER.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

        MAPPER_UNDER_LINE = new ObjectMapper();
        MAPPER_UNDER_LINE.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        MAPPER_UNDER_LINE.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        MAPPER_UNDER_LINE.setPropertyNamingStrategy(PropertyNamingStrategy.SNAKE_CASE);
    }

    public static <T> T parseObject(String jsonStr, Class<T> tClass) {
        try {
            return MAPPER.readValue(jsonStr, tClass);
        } catch (JsonProcessingException e) {
            log.error("parse json string error , string is {}", jsonStr, e);
        }
        return null;
    }

    public static <T> T parseObject(String jsonStr, TypeReference<T> typeReference) {
        try {
            return MAPPER.readValue(jsonStr, typeReference);
        } catch (JsonProcessingException e) {
            log.error("parse json string error , string is {}", jsonStr, e);
        }
        return null;
    }

    public static String toJsonString(Object o) {
        try {
            return MAPPER.writeValueAsString(o);
        } catch (JsonProcessingException e) {
            log.error("to json error, object is {}", o, e);
        }
        return null;
    }

    public static String toJsonStringUnderLine(Object o) {
        try {
            return MAPPER_UNDER_LINE.writeValueAsString(o);
        } catch (JsonProcessingException e) {
            log.error("to json error, object is {}", o, e);
        }
        return null;
    }


    /**
     * 获取类字段映射
     *
     * @param entityClass 实体类
     * @return {@link Map}
     */
    public static Map<String, Field> getFieldMapByClass(Class<?> entityClass) {
        Field[] declaredFields = entityClass.getDeclaredFields();
        Map<String, Field> fieldMap = new HashMap<>();
        for (Field declaredField : declaredFields) {
            declaredField.setAccessible(true);
            fieldMap.put(declaredField.getName(), declaredField);
        }
        return fieldMap;
    }
}
