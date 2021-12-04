package com.dataqiao.dlt.db.util;

import com.dataqiao.dlt.db.util.tableimport.MyTemplateEngine;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.SerializationFeature;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 自定义的json,用于替换fast json中的json对象,使用object mapper封装
 *
 * @author cc
 */
@Slf4j
public class JsonUtil {
    public static final ObjectMapper MAPPER;

    public static  ObjectMapper MAPPER_UNDER_LINE;


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
    public static String toJsonStringUnderLine(Object o){
        try {
            return MAPPER_UNDER_LINE.writeValueAsString(o);
        } catch (JsonProcessingException e) {
            log.error("to json error, object is {}", o, e);
        }
        return null;
    }

    /**
     * 映射到数据库实体
     * 映射到数据库实体,自己写反射生成实体类
     *
     * @param insertData  插入的数据,数据的key value为了节约性能,使用一个数组,数组的0位是key,1位是value
     * @param constructor 构造函数
     * @param fieldMap    缓存地图
     * @return {@link Object}
     * @throws InvocationTargetException 调用目标异常
     * @throws InstantiationException    实例化异常
     * @throws IllegalAccessException    非法访问异常
     */
    public static Object mapToDatabaseEntity(List<Object[]> insertData, Constructor<?> constructor, Map<String, Field> fieldMap) throws InvocationTargetException, InstantiationException, IllegalAccessException {
        Object o = constructor.newInstance();
        int setFieldCount = 0;
        for (Object[] entry : insertData) {
            String k = String.valueOf(entry[0]);
            Object vo = entry[1];
            // map中的key可能对应实体类中key的时候增加了下划线,所以这里处理一下key
            String fieldKey = checkSpecialKey(k);
            Field field = fieldMap.get(fieldKey);
            if (field == null || StringUtils.isEmpty(vo)) {
                continue;
            }
            String v = vo.toString();
            Object setValue = v;
            Class<?> type = field.getType();
            if (type == LocalDateTime.class) {
                if (v.length() > DateUtils.DEFAULT_FORMAT_STR.length()) {
                    v = v.substring(0, DateUtils.DEFAULT_FORMAT_STR.length());
                }
                setValue = LocalDateTime.parse(v, DateUtils.DEFAULT_FORMAT);
            } else if (type == LocalDate.class) {
                setValue = LocalDate.parse(v, DateUtils.YMD_FORMAT);
            } else if (type == LocalTime.class) {
                setValue = LocalTime.parse(v, DateUtils.HMS_FORMAT);
            } else if (type == BigDecimal.class) {
                setValue = new BigDecimal(v);
            } else if (type == BigInteger.class) {
                setValue = new BigInteger(v);
            } else if (type == Integer.class) {
                setValue = Integer.parseInt(v);
            } else if (type == Float.class) {
                setValue = Float.parseFloat(v);
            } else if (type == Double.class) {
                setValue = Double.parseDouble(v);
            } else if (type == Long.class) {
                setValue = Long.parseLong(v);
            } else if (type == byte[].class) {
                setValue = v.getBytes(StandardCharsets.UTF_8);
            } else if (type == Boolean.class) {
                setValue = Boolean.parseBoolean(v);
            }
            field.set(o, setValue);
            setFieldCount++;
        }
        return setFieldCount == 0 ? null : o;
    }

    private static String checkSpecialKey(String k) {
        if (MyTemplateEngine.isSpecialKey(k)) {
            return MyTemplateEngine.UNDER_LINE + k;
        }
        return k;
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
